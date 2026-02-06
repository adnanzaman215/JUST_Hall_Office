using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;
using JustHallAPI.Helpers;
using System.Security.Claims;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            ILogger<PaymentsController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        // POST: api/payments/create
        [HttpPost("create")]
        public async Task<ActionResult<PaymentResponse>> CreatePayment(
            [FromForm] CreatePaymentRequest request,
            [FromForm] IFormFile receiptFile)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Get student information
                var student = await _context.Students
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (student == null)
                {
                    return NotFound(new { message = "Student profile not found. Please complete your profile first." });
                }

                // Validate receipt file
                if (receiptFile == null || receiptFile.Length == 0)
                {
                    return BadRequest(new { message = "Receipt file is required" });
                }

                // Check if transaction ID already exists
                var existingPayment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.TransactionId == request.TransactionId);

                if (existingPayment != null)
                {
                    return BadRequest(new { message = "Payment with this transaction ID already exists" });
                }

                // Upload receipt file
                var receiptUrl = await FileUploadHelper.SaveFileAsync(
                    receiptFile,
                    _environment.WebRootPath ?? Directory.GetCurrentDirectory(),
                    "media/payment_receipts"
                );

                // Create payment record
                var payment = new Payment
                {
                    StudentId = student.Id,
                    PaymentType = request.PaymentType,
                    Amount = request.Amount,
                    PaymentYear = request.PaymentYear,
                    Semester = request.Semester,
                    BankName = request.BankName,
                    TransactionId = request.TransactionId,
                    PaymentDate = request.PaymentDate,
                    ReceiptUrl = receiptUrl,
                    Status = "pending",
                    Notes = request.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                var response = new PaymentResponse
                {
                    Id = payment.Id,
                    StudentId = payment.StudentId,
                    StudentName = student.User.FullName,
                    StudentIdNumber = student.StudentId,
                    PaymentType = payment.PaymentType,
                    Amount = payment.Amount,
                    PaymentYear = payment.PaymentYear,
                    Semester = payment.Semester,
                    BankName = payment.BankName,
                    TransactionId = payment.TransactionId,
                    PaymentDate = payment.PaymentDate,
                    ReceiptUrl = payment.ReceiptUrl,
                    Status = payment.Status,
                    Notes = payment.Notes,
                    CreatedAt = payment.CreatedAt
                };

                return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new { message = "An error occurred while creating payment" });
            }
        }

        // GET: api/payments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentResponse>> GetPayment(int id)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (payment == null)
                {
                    return NotFound(new { message = "Payment not found" });
                }

                var response = MapToPaymentResponse(payment);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment");
                return StatusCode(500, new { message = "An error occurred while retrieving payment" });
            }
        }

        // GET: api/payments/my-payments
        [HttpGet("my-payments")]
        public async Task<ActionResult<List<PaymentResponse>>> GetMyPayments()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null)
                {
                    return NotFound(new { message = "Student profile not found. Please complete your profile first." });
                }

                var payments = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .Where(p => p.StudentId == student.Id)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                var response = payments.Select(MapToPaymentResponse).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments");
                return StatusCode(500, new { message = "An error occurred while retrieving payments" });
            }
        }

        // GET: api/payments/dues
        [HttpGet("dues")]
        public async Task<ActionResult<PaymentDuesResponse>> GetPaymentDues([FromQuery] int? year = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null)
                {
                    return NotFound(new { message = "Student profile not found. Please complete your profile first." });
                }

                int targetYear = year ?? DateTime.UtcNow.Year;

                var paymentsForYear = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .Where(p => p.StudentId == student.Id && p.PaymentYear == targetYear)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                decimal verifiedAmount = paymentsForYear
                    .Where(p => p.Status == "verified")
                    .Sum(p => p.Amount);

                decimal requiredAmount = 15000; // Default yearly hall fee
                decimal dueAmount = Math.Max(0, requiredAmount - verifiedAmount);

                var response = new PaymentDuesResponse
                {
                    CurrentYear = targetYear,
                    RequiredAmount = requiredAmount,
                    PaidAmount = verifiedAmount,
                    DueAmount = dueAmount,
                    IsPaid = verifiedAmount >= requiredAmount,
                    PaymentsForYear = paymentsForYear.Select(MapToPaymentResponse).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment dues");
                return StatusCode(500, new { message = "An error occurred while retrieving payment dues" });
            }
        }

        // GET: api/payments/all-dues (All years for current student)
        [HttpGet("all-dues")]
        public async Task<ActionResult<List<PaymentDuesResponse>>> GetAllPaymentDues()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null)
                {
                    return NotFound(new { message = "Student profile not found. Please complete your profile first." });
                }

                // Get all payments for this student
                var allPayments = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .Where(p => p.StudentId == student.Id)
                    .OrderByDescending(p => p.PaymentYear)
                    .ThenByDescending(p => p.CreatedAt)
                    .ToListAsync();

                // Get unique years from payments and add typical academic years
                var currentYear = DateTime.UtcNow.Year;
                var paymentYears = allPayments.Select(p => p.PaymentYear).Distinct().ToList();
                
                // Add academic years (assume 1st year to 4th year)
                var academicYears = new List<int>();
                for (int i = 0; i < 4; i++)
                {
                    int year = currentYear - i;
                    if (!academicYears.Contains(year))
                        academicYears.Add(year);
                }
                
                // Add any years from payments that aren't in academic years
                foreach (var year in paymentYears)
                {
                    if (!academicYears.Contains(year))
                        academicYears.Add(year);
                }
                
                academicYears = academicYears.OrderByDescending(y => y).ToList();

                var duesResponses = new List<PaymentDuesResponse>();
                decimal requiredAmount = 15000; // Default yearly hall fee

                foreach (var year in academicYears)
                {
                    var paymentsForYear = allPayments.Where(p => p.PaymentYear == year).ToList();
                    
                    decimal verifiedAmount = paymentsForYear
                        .Where(p => p.Status == "verified")
                        .Sum(p => p.Amount);

                    decimal dueAmount = Math.Max(0, requiredAmount - verifiedAmount);

                    duesResponses.Add(new PaymentDuesResponse
                    {
                        CurrentYear = year,
                        RequiredAmount = requiredAmount,
                        PaidAmount = verifiedAmount,
                        DueAmount = dueAmount,
                        IsPaid = verifiedAmount >= requiredAmount,
                        PaymentsForYear = paymentsForYear.Select(MapToPaymentResponse).ToList()
                    });
                }

                return Ok(duesResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all payment dues");
                return StatusCode(500, new { message = "An error occurred while retrieving payment dues" });
            }
        }

        // GET: api/payments/all (Admin/Staff only)
        [HttpGet("all")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<ActionResult<List<PaymentResponse>>> GetAllPayments(
            [FromQuery] string? status = null,
            [FromQuery] int? year = null)
        {
            try
            {
                var query = _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(p => p.Status == status);
                }

                if (year.HasValue)
                {
                    query = query.Where(p => p.PaymentYear == year.Value);
                }

                var payments = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                var response = payments.Select(MapToPaymentResponse).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all payments");
                return StatusCode(500, new { message = "An error occurred while retrieving payments" });
            }
        }

        // POST: api/payments/verify (Staff/Admin only)
        [HttpPost("verify")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<ActionResult<PaymentResponse>> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Get staff ID
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                if (staff == null)
                {
                    return NotFound(new { message = "Staff profile not found" });
                }

                var payment = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(p => p.Id == request.PaymentId);

                if (payment == null)
                {
                    return NotFound(new { message = "Payment not found" });
                }

                if (payment.Status != "pending")
                {
                    return BadRequest(new { message = "Payment has already been processed" });
                }

                if (request.Status != "verified" && request.Status != "rejected")
                {
                    return BadRequest(new { message = "Invalid status. Must be 'verified' or 'rejected'" });
                }

                if (request.Status == "rejected" && string.IsNullOrEmpty(request.RejectionReason))
                {
                    return BadRequest(new { message = "Rejection reason is required when rejecting a payment" });
                }

                payment.Status = request.Status;
                payment.VerifiedBy = staff.Id;
                payment.VerifiedAt = DateTime.UtcNow;
                payment.RejectionReason = request.RejectionReason;
                payment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedPayment = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .FirstOrDefaultAsync(p => p.Id == payment.Id);

                var response = MapToPaymentResponse(updatedPayment!);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying payment");
                return StatusCode(500, new { message = "An error occurred while verifying payment" });
            }
        }

        // GET: api/payments/summary (Admin/Staff only)
        [HttpGet("summary")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<ActionResult<PaymentSummaryResponse>> GetPaymentSummary()
        {
            try
            {
                var allPayments = await _context.Payments
                    .Include(p => p.Student)
                    .ThenInclude(s => s.User)
                    .Include(p => p.Verifier)
                    .ThenInclude(v => v.User)
                    .ToListAsync();

                var summary = new PaymentSummaryResponse
                {
                    TotalPayments = allPayments.Count,
                    PendingPayments = allPayments.Count(p => p.Status == "pending"),
                    VerifiedPayments = allPayments.Count(p => p.Status == "verified"),
                    RejectedPayments = allPayments.Count(p => p.Status == "rejected"),
                    TotalAmountPaid = allPayments.Where(p => p.Status == "verified").Sum(p => p.Amount),
                    RecentPayments = allPayments
                        .OrderByDescending(p => p.CreatedAt)
                        .Take(10)
                        .Select(MapToPaymentResponse)
                        .ToList()
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment summary");
                return StatusCode(500, new { message = "An error occurred while retrieving payment summary" });
            }
        }

        // Helper method to map Payment to PaymentResponse
        private PaymentResponse MapToPaymentResponse(Payment payment)
        {
            return new PaymentResponse
            {
                Id = payment.Id,
                StudentId = payment.StudentId,
                StudentName = payment.Student?.User?.FullName ?? "Unknown",
                StudentIdNumber = payment.Student?.StudentId ?? "Unknown",
                PaymentType = payment.PaymentType,
                Amount = payment.Amount,
                PaymentYear = payment.PaymentYear,
                Semester = payment.Semester,
                BankName = payment.BankName,
                TransactionId = payment.TransactionId,
                PaymentDate = payment.PaymentDate,
                ReceiptUrl = payment.ReceiptUrl,
                Status = payment.Status,
                VerifiedBy = payment.VerifiedBy,
                VerifierName = payment.Verifier?.User?.FullName,
                VerifiedAt = payment.VerifiedAt,
                RejectionReason = payment.RejectionReason,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt
            };
        }
    }
}
