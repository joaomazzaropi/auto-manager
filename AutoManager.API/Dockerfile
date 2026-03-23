# ─── Build ────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o projeto e restaura dependências
COPY AutoManager.API.csproj .
RUN dotnet restore

# Copia o restante e publica
COPY . .
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime ──────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Cria pasta para o banco SQLite persistir
RUN mkdir -p /app/data

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

ENTRYPOINT ["dotnet", "AutoManager.API.dll"]
