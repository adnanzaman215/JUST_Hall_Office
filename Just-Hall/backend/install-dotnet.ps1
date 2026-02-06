# .NET 8 SDK Installation Script
# Run this script to download and install .NET 8 SDK

Write-Host "=== .NET 8 SDK Installation Helper ===" -ForegroundColor Cyan
Write-Host ""

# Check if .NET SDK is already installed
$dotnetInstalled = $false
try {
    $version = & dotnet --version 2>$null
    if ($version) {
        Write-Host "✅ .NET SDK is already installed!" -ForegroundColor Green
        Write-Host "Version: $version" -ForegroundColor Yellow
        $dotnetInstalled = $true
    }
} catch {
    Write-Host "⚠️ .NET SDK not found" -ForegroundColor Yellow
}

if (-not $dotnetInstalled) {
    Write-Host ""
    Write-Host "=== Installation Options ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Download Manually" -ForegroundColor Yellow
    Write-Host "  Visit: https://dotnet.microsoft.com/download/dotnet/8.0"
    Write-Host "  Download: .NET 8.0 SDK (Windows x64)"
    Write-Host ""
    
    Write-Host "Option 2: Download with PowerShell" -ForegroundColor Yellow
    Write-Host "  We can download the installer for you"
    Write-Host ""
    
    $choice = Read-Host "Would you like to download the installer now? (Y/N)"
    
    if ($choice -eq "Y" -or $choice -eq "y") {
        Write-Host ""
        Write-Host "Downloading .NET 8 SDK installer..." -ForegroundColor Green
        
        $downloadUrl = "https://download.visualstudio.microsoft.com/download/pr/b280d97f-25a9-4ab7-8a12-8291aa3af117/a37ed0e3c4d9db7134ca5076d96d9e3b/dotnet-sdk-8.0.403-win-x64.exe"
        $installerPath = "$env:TEMP\dotnet-sdk-8.0-installer.exe"
        
        try {
            Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
            Write-Host "✅ Download complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Starting installer..." -ForegroundColor Yellow
            Write-Host "Please follow the installation wizard." -ForegroundColor Yellow
            Write-Host ""
            
            Start-Process -FilePath $installerPath -Wait
            
            Write-Host ""
            Write-Host "Installation complete!" -ForegroundColor Green
            Write-Host "Please restart your PowerShell terminal." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "After restarting, run:" -ForegroundColor Cyan
            Write-Host "  dotnet --version" -ForegroundColor White
            Write-Host "  cd 'c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet'" -ForegroundColor White
            Write-Host "  dotnet run" -ForegroundColor White
            
        } catch {
            Write-Host "❌ Download failed: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "Please download manually from:" -ForegroundColor Yellow
            Write-Host "https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Cyan
        }
    } else {
        Write-Host ""
        Write-Host "Manual Installation Steps:" -ForegroundColor Yellow
        Write-Host "1. Visit: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor White
        Write-Host "2. Download: .NET 8.0 SDK (Windows x64)" -ForegroundColor White
        Write-Host "3. Run the installer" -ForegroundColor White
        Write-Host "4. Restart PowerShell" -ForegroundColor White
        Write-Host "5. Run: dotnet --version" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "You can now run the project!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run these commands:" -ForegroundColor Cyan
    Write-Host "  cd 'c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet'" -ForegroundColor White
    Write-Host "  dotnet restore" -ForegroundColor White
    Write-Host "  dotnet build" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    Write-Host ""
    Write-Host "Or simply run:" -ForegroundColor Cyan
    Write-Host "  .\start.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
