using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class GetInboxContactsQueryHandler : IRequestHandler<GetInboxContactsQuery, InboxResultDto>
    {
        private readonly ISharedRepository _sharedRepository;
        private readonly IUserRepository _userRepository;

        public GetInboxContactsQueryHandler(ISharedRepository sharedRepository, IUserRepository userRepository)
        {
            _sharedRepository = sharedRepository;
            _userRepository = userRepository;
        }

        public async Task<InboxResultDto> Handle(GetInboxContactsQuery request, CancellationToken cancellationToken)
        {
            var result = new InboxResultDto();

            // 1. Process Main Inbox
            var mainShares = await _sharedRepository.GetInboxAsync(request.UserId);
            var mainContacts = await ProcessSharesToContacts(mainShares, request.UserId);
            result.MainInbox = mainContacts;

            // 2. Process Message Requests
            var requestShares = await _sharedRepository.GetMessageRequestsAsync(request.UserId);
            var requestContacts = await ProcessSharesToContacts(requestShares, request.UserId);
            result.MessageRequests = requestContacts;

            return result;
        }

        private async Task<List<InboxContactDto>> ProcessSharesToContacts(IEnumerable<MediaShare> shares, Guid currentUserId)
        {
            var contacts = new List<InboxContactDto>();
            
            // Group by the "other" user
            var grouped = shares.GroupBy(s => s.SenderId == currentUserId ? s.ReceiverId : s.SenderId);

            foreach (var group in grouped)
            {
                var otherUserId = group.Key;
                var latestShare = group.OrderByDescending(s => s.SharedAt).First();
                
                var userProfile = await _userRepository.GetProfileByUserIdAsync(otherUserId);
                if (userProfile != null)
                {
                    contacts.Add(new InboxContactDto
                    {
                        UserId = otherUserId,
                        FullName = userProfile.FullName,
                        AvatarUrl = userProfile.AvatarUrl,
                        LastMessage = latestShare.Message,
                        LastMessageAt = latestShare.SharedAt,
                        IsUnread = false // Can be expanded later
                    });
                }
            }

            return contacts.OrderByDescending(c => c.LastMessageAt).ToList();
        }
    }
}
