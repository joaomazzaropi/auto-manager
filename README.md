# AutoManager

Sistema de gestão de ordens de serviço para oficinas automotivas.  
Projeto fullstack desenvolvido com **ASP.NET Core 8**, **Angular 17** e **SQLite**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | ASP.NET Core 8 Web API (C#) |
| Banco de dados | SQLite + Entity Framework Core |
| Autenticação | JWT Bearer + BCrypt |
| Frontend | Angular 17 (Standalone Components) |
| Testes | xUnit + FluentAssertions + EF InMemory |
| Documentação | Swagger / OpenAPI |

---

## Estrutura do Projeto

```
AutoManager/
├── AutoManager.API/                  # Backend .NET
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ClientesController.cs
│   │   ├── VeiculosController.cs
│   │   ├── OrdensServicoController.cs
│   │   └── RelatoriosController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── DTOs/
│   │   ├── Dtos.cs
│   │   ├── PaginacaoDtos.cs          # PagedResult<T> e query params
│   │   └── RelatorioDtos.cs          # Modelos dos relatórios
│   ├── Entities/
│   │   ├── Usuario.cs
│   │   ├── Cliente.cs
│   │   ├── Veiculo.cs
│   │   └── OrdemServico.cs
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── ClienteService.cs
│   │   ├── OrdemServicoService.cs
│   │   └── RelatorioService.cs       # Queries estilo PL/SQL
│   ├── Program.cs
│   └── appsettings.json
│
├── AutoManager.Tests/                # Testes unitários
│   ├── Helpers/
│   │   └── DbHelper.cs               # Banco em memória isolado por teste
│   └── Services/
│       ├── AuthServiceTests.cs       # 5 testes
│       ├── ClienteServiceTests.cs    # 9 testes
│       └── OrdemServicoServiceTests.cs # 10 testes
│
└── automanager-web/                  # Frontend Angular
    └── src/app/
        ├── models/models.ts
        ├── directives/
        │   └── mask.directive.ts     # Máscaras: CPF, telefone, placa
        ├── components/
        │   └── paginacao/            # Componente de paginação reutilizável
        ├── services/
        │   ├── auth.service.ts
        │   ├── cliente.service.ts
        │   ├── ordem.service.ts
        │   └── relatorio.service.ts
        ├── interceptors/
        │   └── auth.interceptor.ts   # Injeta JWT automaticamente
        ├── guards/
        │   └── auth.guard.ts         # Proteção de rotas
        ├── layout/
        │   └── shell/                # Sidebar + navegação principal
        └── pages/
            ├── login/
            ├── register/
            ├── dashboard/            # Cards de resumo + OS abertas
            ├── clientes/             # CRUD completo com filtros e paginação
            ├── veiculos/             # Cadastro com criação inline de cliente
            ├── ordens/               # Gestão de OS com filtros e paginação
            └── relatorios/           # Relatórios com gráfico e tabelas
```

---

## Como rodar

### Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) e Angular CLI (`npm install -g @angular/cli`)

### Backend

```bash
# Clone o repositório
git clone https://github.com/joaomazzaropi/auto-manager.git

# Entre na pasta da API
cd auto-manager/AutoManager.API

# Restaure os pacotes
dotnet restore

# Crie e aplique as migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Rode a aplicação (modo desenvolvimento)
set ASPNETCORE_ENVIRONMENT=Development
dotnet run
```

Acesse o Swagger em: **http://localhost:5000/swagger**

### Frontend

```bash
# Em outro terminal, entre na pasta do frontend
cd auto-manager/automanager-web

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
ng serve
```

Acesse o sistema em: **http://localhost:4200**

### Testes

```bash
cd auto-manager/AutoManager.Tests
dotnet test --verbosity normal
```

---

## Autenticação

A API usa **JWT Bearer**. No frontend, o token é salvo automaticamente após o login e injetado em todas as requisições via interceptor.

Para testar diretamente no Swagger:

1. Crie uma conta em `POST /api/auth/register`
2. Faça login em `POST /api/auth/login` e copie o `token`
3. Clique em **Authorize** e cole `Bearer {seu_token}`

---

## Endpoints

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Login e geração de token |

### Clientes
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clientes` | Listar com filtros e paginação |
| GET | `/api/clientes/{id}` | Buscar por ID |
| POST | `/api/clientes` | Cadastrar |
| PUT | `/api/clientes/{id}` | Atualizar |
| DELETE | `/api/clientes/{id}` | Remover |

**Filtros:** `?nome=` \| `?cpf=` \| `?pagina=` \| `?tamanho=`

### Veículos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/veiculos` | Listar todos |
| GET | `/api/veiculos/{id}` | Buscar por ID |
| POST | `/api/veiculos` | Cadastrar |
| DELETE | `/api/veiculos/{id}` | Remover |

### Ordens de Serviço
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/ordensservico` | Listar com filtros e paginação |
| GET | `/api/ordensservico/{id}` | Buscar por ID |
| POST | `/api/ordensservico` | Abrir nova OS |
| PATCH | `/api/ordensservico/{id}/status` | Atualizar status |

**Filtros:** `?status=` \| `?cliente=` \| `?placa=` \| `?pagina=` \| `?tamanho=`

**Status disponíveis:** `Aberta` \| `EmAndamento` \| `Concluida` \| `Cancelada`

### Relatórios
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/relatorios/status` | Resumo por status |
| GET | `/api/relatorios/periodo` | Faturamento por mês |
| GET | `/api/relatorios/clientes` | Ranking de clientes |
| GET | `/api/relatorios/veiculos` | Veículos mais atendidos |

**Parâmetros:** `?meses=6` (período) \| `?top=10` (ranking)

---

## Próximos passos

- [ ] Docker / docker-compose para facilitar o setup
- [ ] Deploy com CI/CD

---

## Autor

Desenvolvido por mim, como projeto de portfólio.