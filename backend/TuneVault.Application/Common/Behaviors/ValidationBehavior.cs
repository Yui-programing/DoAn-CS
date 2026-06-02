using FluentValidation;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace TuneVault.Application.Common.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        // Tự động gom tất cả các bộ luật (Validators) đã viết cho Request này
        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (_validators.Any())
            {
                var context = new ValidationContext<TRequest>(request);

                // Kích hoạt quét toàn bộ các luật kiểm tra dữ liệu đầu vào
                var validationResults = await Task.WhenAll(
                    _validators.Select(v => v.ValidateAsync(context, cancellationToken))
                );

                // Lọc ra các lỗi phát hiện được
                var failures = validationResults
                    .SelectMany(r => r.Errors)
                    .Where(f => f != null)
                    .ToList();

                // Nếu có bất kỳ lỗi nào, chặn đứng luồng chạy và ném ra Exception
                if (failures.Count != 0)
                {
                    throw new ValidationException(failures);
                }
            }

            // Nếu dữ liệu sạch sẽ, cho phép đi tiếp đến đích (Handler xử lý DB)
            return await next();
        }
    }
}