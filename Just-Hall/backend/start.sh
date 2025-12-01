#!/bin/bash

# Restore packages
echo "Restoring NuGet packages..."
dotnet restore

# Build the project
echo "Building project..."
dotnet build

# Run the application
echo "Starting JustHall API on http://localhost:8000"
echo "Swagger documentation: http://localhost:8000/swagger"
dotnet run
