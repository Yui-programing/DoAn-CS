using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Models
{
    public class ResultPage<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();

        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    }
}
