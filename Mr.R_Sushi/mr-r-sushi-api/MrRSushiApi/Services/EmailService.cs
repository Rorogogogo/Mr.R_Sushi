using System.Net;
using System.Net.Mail;
using MrRSushiApi.Models;
using MrRSushiApi.Models.DTOs;

namespace MrRSushiApi.Services;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(Order order);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _emailFrom = "mrrsushi.cn@gmail.com";
    private readonly string _emailPassword = "dwlymgaxfdkiqokx";
    private readonly string _emailTo = "908393245@qq.com";
    private readonly string _smtpHost = "smtp.gmail.com";
    private readonly int _smtpPort = 587;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendOrderConfirmationAsync(Order order)
    {
        try
        {
            var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailFrom, _emailPassword)
            };

            var message = new MailMessage
            {
                From = new MailAddress(_emailFrom, "Mr.R Sushi"),
                Subject = $"新订单通知 - 订单号: {order.OrderNumber}",
                IsBodyHtml = true,
                Body = BuildOrderEmailBody(order)
            };

            message.To.Add(_emailTo);

            await client.SendMailAsync(message);
            _logger.LogInformation($"Order confirmation email sent for order {order.OrderNumber}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send order confirmation email for order {order.OrderNumber}");
            // Don't throw the exception - we don't want to fail the order if email fails
        }
    }

    private string BuildOrderEmailBody(Order order)
    {
        var body = $@"
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .order-container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .order-header {{ background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 20px; }}
                .order-details {{ margin-bottom: 20px; }}
                .order-items {{ width: 100%; border-collapse: collapse; }}
                .order-items th, .order-items td {{ padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }}
                .total {{ font-weight: bold; text-align: right; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class='order-container'>
                <div class='order-header'>
                    <h2>新订单通知</h2>
                    <p>订单号: {order.OrderNumber}</p>
                    <p>下单时间: {order.OrderDate}</p>
                </div>
                
                <div class='order-details'>
                    <h3>客户信息</h3>
                    <p>姓名: {order.CustomerName}</p>
                    <p>电话: {order.PhoneNumber}</p>
                    <p>预订时间: {order.ReservationTime}</p>
                    {(string.IsNullOrEmpty(order.Address) ? "" : $"<p>地址: {order.Address}</p>")}
                </div>
                
                <div class='order-items-container'>
                    <h3>订单项目</h3>
                    <table class='order-items'>
                        <thead>
                            <tr>
                                <th>菜品</th>
                                <th>数量</th>
                                <th>单价</th>
                                <th>小计</th>
                            </tr>
                        </thead>
                        <tbody>";

        foreach (var item in order.OrderItems)
        {
            var subtotal = item.UnitPrice * item.Quantity;
            body += $@"
                            <tr>
                                <td>{item.MenuItem?.Name ?? $"菜品 #{item.MenuItemId}"}</td>
                                <td>{item.Quantity}</td>
                                <td>{item.UnitPrice}元</td>
                                <td>{subtotal}元</td>
                            </tr>";
        }

        body += $@"
                        </tbody>
                    </table>
                    <div class='total'>
                        <p>总计: {order.TotalAmount}元</p>
                    </div>
                </div>
            </div>
        </body>
        </html>";

        return body;
    }
} 