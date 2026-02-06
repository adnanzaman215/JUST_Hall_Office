# Restore packages
Write-Host "Restoring NuGet packages..." -ForegroundColor Green
dotnet restore

# Build the project
Write-Host "Building project..." -ForegroundColor Green
dotnet build

# Run the application
Write-Host "Starting JustHall API on http://localhost:8000" -ForegroundColor Green
Write-Host "Swagger documentation: http://localhost:8000/swagger" -ForegroundColor Cyan
dotnet run
