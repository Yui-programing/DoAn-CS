# 1. Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# 2. Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy toàn bộ thư mục backend vào để giữ nguyên cấu trúc tham chiếu Clean Architecture
COPY ["backend/", "backend/"]

# Restore và build từ thư mục API
WORKDIR "/src/backend/TuneVault.API"
RUN dotnet restore "TuneVault.API.csproj"
RUN dotnet build "TuneVault.API.csproj" -c Release -o /app/build

# 3. Publish
FROM build AS publish
RUN dotnet publish "TuneVault.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 4. Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TuneVault.API.dll"]