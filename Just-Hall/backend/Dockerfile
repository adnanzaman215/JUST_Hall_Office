# Use official .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8000

# Use SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["JustHallAPI.csproj", "./"]
RUN dotnet restore "JustHallAPI.csproj"
COPY . .
RUN dotnet build "JustHallAPI.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "JustHallAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create media directory
RUN mkdir -p /app/media/profile_photos

ENTRYPOINT ["dotnet", "JustHallAPI.dll"]
