# Script to create sample notices using the API
# Run this after starting the backend server
# Make sure you have an admin user and get their token

$baseUrl = "http://localhost:8000/api/notices"

# Sample notices data
$notices = @(
    @{
        title = "Welcome to JUST Hall Notice Board"
        body = "Dear Students, Welcome to the official notice board for JUST Hall. All important announcements, circulars, and updates will be posted here. Please check regularly for updates regarding hall activities, seat allocations, fee notices, and other important information."
        category = "General"
        author = "Hall Provost"
        pinned = $true
        attachmentUrl = "https://example.com/welcome-guide.pdf"
    },
    @{
        title = "Seat Allocation for Session 2025-26"
        body = "The seat allocation process for the academic session 2025-26 will commence from February 15, 2026. All eligible students are requested to complete their applications through the hall portal. Required documents: Student ID, Admission letter, Previous semester results, and Payment receipt."
        category = "Seat Allocation"
        author = "Seat Allocation Committee"
        pinned = $true
        attachmentUrl = "https://example.com/seat-allocation-guidelines.pdf"
    },
    @{
        title = "Hall Fee Payment Deadline - February 2026"
        body = "All residents are hereby notified that the hall fee for February 2026 must be paid by February 20, 2026. Late payment will incur a penalty of 500 BDT. Payment can be made at the hall office or through online banking. Please collect your receipt after payment."
        category = "Fee Notice"
        author = "Hall Administration"
        pinned = $false
        attachmentUrl = "https://example.com/fee-structure.pdf"
    },
    @{
        title = "Emergency Contact Numbers Updated"
        body = "Emergency contact numbers have been updated. For any emergency, please contact: Hall Security: 01700-000000, Hall Provost: 01700-111111, Medical Emergency: 999, Fire Service: 01700-222222. Save these numbers in your phone immediately."
        category = "Emergency"
        author = "Hall Security"
        pinned = $true
    },
    @{
        title = "Cultural Night 2026 - Call for Participants"
        body = "The annual Cultural Night will be held on March 15, 2026, at 6:00 PM in the hall auditorium. We invite all talented students to participate in singing, dancing, drama, and poetry recitation. Interested students please register by March 1, 2026, at the hall office."
        category = "Event"
        author = "Cultural Committee"
        pinned = $false
        attachmentUrl = "https://example.com/cultural-night-2026.pdf"
    },
    @{
        title = "Water Supply Interruption - February 10"
        body = "Due to pipeline maintenance work, water supply will be interrupted on February 10, 2026, from 9:00 AM to 3:00 PM. Residents are requested to store adequate water in advance. We apologize for the inconvenience."
        category = "Maintenance"
        author = "Maintenance Department"
        pinned = $false
    },
    @{
        title = "Covid-19 Safety Guidelines - Updated"
        body = "In light of recent health advisories, all residents must follow updated Covid-19 safety guidelines: 1) Wear masks in common areas, 2) Maintain social distancing, 3) Sanitize hands regularly, 4) Report any symptoms immediately to the hall medical officer."
        category = "Circular"
        author = "Health & Safety Committee"
        pinned = $false
        attachmentUrl = "https://example.com/covid-guidelines-2026.pdf"
    },
    @{
        title = "Library Timing Update"
        body = "The hall library will now remain open from 8:00 AM to 10:00 PM on all days including weekends. Students can access reference books, journals, and study space during these hours. Please maintain silence and follow library rules."
        category = "General"
        author = "Library Committee"
        pinned = $false
    }
)

Write-Host "Notice Creation Script" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Make sure the backend server is running on http://localhost:8000" -ForegroundColor White
Write-Host "2. Login as an admin user in the frontend" -ForegroundColor White
Write-Host "3. Open browser DevTools > Application > Local Storage" -ForegroundColor White
Write-Host "4. Copy the 'auth_token' value" -ForegroundColor White
Write-Host "5. Paste it below when prompted" -ForegroundColor White
Write-Host ""

$token = Read-Host "Enter your admin JWT token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Error: No token provided. Exiting." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Creating notices..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($notice in $notices) {
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $body = $notice | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body
        
        Write-Host "✓ Created: $($notice.title)" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "✗ Failed: $($notice.title)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "Successfully created: $successCount notices" -ForegroundColor Green
Write-Host "Failed: $errorCount notices" -ForegroundColor Red
Write-Host ""
Write-Host "You can now view the notices at http://localhost:3000/notices" -ForegroundColor Yellow
