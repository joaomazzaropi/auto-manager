# AutoManager

Sistema de gestão de ordens de serviço para oficinas automotivas.  
Projeto fullstack desenvolvido com **ASP.NET Core 8**, **Angular** e **SQLite**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | ASP.NET Core 8 Web API (C#) |
| Banco de dados | SQLite + Entity Framework Core |
| Autenticação | JWT Bearer |
| Frontend (em breve) | Angular 17 |
| Documentação | Swagger / OpenAPI |

---

## Estrutura do Projeto

```
AutoManager/
└── AutoManager.API/
    ├── Controllers/        # Endpoints HTTP
    │   ├── AuthController.cs
    │   ├── ClientesController.cs
    │   └── OrdensServicoController.cs
    ├── Data/
    │   └── AppDbContext.cs # Contexto do EF Core
    ├── DTOs/               # Objetos de transferência de dados
    ├── Entities/           # Modelos do banco
    │   ├── Usuario.cs
    │   ├── Cliente.cs
    │   ├── Veiculo.cs
    │   └── OrdemServico.cs
    ├── Services/           # Regras de negócio
    │   ├── AuthService.cs
    │   ├── ClienteService.cs
    │   └── OrdemServicoService.cs
    ├── Program.cs
    └── appsettings.json
```

---

## Como rodar

### Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download)

### Passos

```bash
# Clone o repositório
git clone https://github.com/joaomazzaropi/auto-manager.git
cd auto-manager/AutoManager.API

# Restaure os pacotes
dotnet restore

# Crie e aplique as migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Rode a aplicação
dotnet run
```

Acesse o Swagger em: **http://localhost:5000/swagger**

---

## Autenticação

A API usa **JWT Bearer**. Para acessar os endpoints protegidos:

1. Crie uma conta em `POST /api/auth/register`
2. Faça login em `POST /api/auth/login` e copie o `token`
3. No Swagger, clique em **Authorize** e cole `Bearer {seu_token}`

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
| GET | `/api/clientes` | Listar todos |
| GET | `/api/clientes/{id}` | Buscar por ID |
| POST | `/api/clientes` | Cadastrar |
| PUT | `/api/clientes/{id}` | Atualizar |
| DELETE | `/api/clientes/{id}` | Remover |

### Ordens de Serviço
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/ordensservico` | Listar (filtro por `?status=`) |
| GET | `/api/ordensservico/{id}` | Buscar por ID |
| POST | `/api/ordensservico` | Abrir nova OS |
| PATCH | `/api/ordensservico/{id}/status` | Atualizar status |

**Status disponíveis:** `Aberta` \| `EmAndamento` \| `Concluida` \| `Cancelada`

---

## Próximos passos

- [ ] CRUD de Veículos
- [ ] Frontend Angular
- [ ] Filtros e paginação
- [ ] Relatórios com queries PL/SQL-style
- [ ] Testes unitários com xUnit
- [ ] Docker / docker-compose

---

## Autor

Eu mesmo. Desenvolvido para projeto de portfólio.
