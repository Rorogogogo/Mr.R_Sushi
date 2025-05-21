using System;

namespace MrRSushiApi.Models.DTOs
{
    public class OrderCheckoutDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime ReservationTime { get; set; }
    }
} 