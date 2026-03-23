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

## Funcionalidades

- Cadastro e gestão de **clientes** com filtros e paginação
- Cadastro de **veículos** com criação inline de cliente — sem precisar sair da tela
- Abertura e acompanhamento de **ordens de serviço** com filtros por status, cliente e placa
- **Relatórios** de faturamento por mês, ranking de clientes e veículos mais atendidos
- **Autenticação JWT** com logout automático ao expirar a sessão
- **Máscaras** de CPF, telefone e placa nos formulários
- **18 testes unitários** cobrindo os services principais

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
│   │   └── AppDbContext.cs           # Contexto do EF Core
│   ├── DTOs/
│   │   ├── Dtos.cs                   # Objetos de transferência de dados
│   │   ├── PaginacaoDtos.cs          # PagedResult<T> e query params
│   │   └── RelatorioDtos.cs          # Modelos dos relatórios
│   ├── Entities/
│   │   ├── Usuario.cs
│   │   ├── Cliente.cs
│   │   ├── Veiculo.cs
│   │   └── OrdemServico.cs
│   ├── Services/
│   │   ├── AuthService.cs            # Registro, login e geração de JWT
│   │   ├── ClienteService.cs         # CRUD com filtros e paginação
│   │   ├── OrdemServicoService.cs    # Gestão de OS e atualização de status
│   │   └── RelatorioService.cs       # Queries estilo PL/SQL
│   ├── Program.cs                    # Pipeline, DI, CORS, JWT, Swagger
│   └── appsettings.json              # Connection string e config JWT
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
        ├── models/models.ts          # Interfaces TypeScript
        ├── directives/
        │   └── mask.directive.ts     # Máscaras: CPF, telefone, placa
        ├── components/
        │   ├── paginacao/            # Componente de paginação reutilizável
        │   └── toast/                # Notificações globais
        ├── services/
        │   ├── auth.service.ts       # Login, register, token no localStorage
        │   ├── cliente.service.ts    # Chamadas HTTP de clientes
        │   ├── ordem.service.ts      # Chamadas HTTP de OS e veículos
        │   ├── relatorio.service.ts  # Chamadas HTTP de relatórios
        │   └── toast.service.ts      # Gerenciamento de notificações
        ├── interceptors/
        │   └── auth.interceptor.ts   # Injeta JWT e detecta sessão expirada
        ├── guards/
        │   └── auth.guard.ts         # Proteção de rotas privadas
        ├── layout/shell/             # Sidebar + navegação principal
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

# Crie e aplique as migrations (gera o banco SQLite automaticamente)
dotnet ef migrations add InitialCreate
dotnet ef database update

# Rode a aplicação em modo desenvolvimento (necessário para o Swagger)
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
# Entre na pasta de testes
cd auto-manager/AutoManager.Tests

# Execute todos os testes
dotnet test

# Com resultado detalhado por teste
dotnet test --verbosity normal
```

---

## Autenticação

A API usa **JWT Bearer**. No frontend, o token é salvo automaticamente após o login e injetado em todas as requisições via interceptor. Quando o token expira, o sistema exibe um aviso e redireciona para o login automaticamente.

Para testar diretamente no Swagger:

1. Crie uma conta em `POST /api/auth/register`
2. Faça login em `POST /api/auth/login` e copie o campo `token` da resposta
3. Clique em **Authorize** no topo direito do Swagger
4. Cole `Bearer {seu_token}` e confirme
5. Agora todos os endpoints protegidos estão liberados para uso

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

**Filtros disponíveis:** `?nome=` \| `?cpf=` \| `?pagina=` \| `?tamanho=`

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

**Filtros disponíveis:** `?status=` \| `?cliente=` \| `?placa=` \| `?pagina=` \| `?tamanho=`

**Status disponíveis:** `Aberta` \| `EmAndamento` \| `Concluida` \| `Cancelada`

### Relatórios
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/relatorios/status` | Quantidade e valores agrupados por status |
| GET | `/api/relatorios/periodo` | Ordens abertas, concluídas e faturamento por mês |
| GET | `/api/relatorios/clientes` | Clientes com mais OS e maior faturamento |
| GET | `/api/relatorios/veiculos` | Veículos com mais atendimentos |

**Parâmetros:** `?meses=6` (janela de tempo do relatório de período) \| `?top=10` (limite do ranking)

---

## FAQ

**Por que o Swagger abre mas os endpoints retornam 401?**  
O Swagger não envia o token automaticamente. Clique em **Authorize** no topo direito, cole `Bearer {seu_token}` e confirme antes de executar qualquer endpoint protegido.

**Por que preciso rodar com `set ASPNETCORE_ENVIRONMENT=Development`?**  
Por padrão o .NET sobe em modo Production, e o Swagger só está habilitado em Development. Sem essa variável, `http://localhost:5000/swagger` retorna 404.

**O frontend está dando erro de CORS. O que fazer?**  
Confirme que o `Program.cs` contém `app.UseCors("Angular")` posicionado antes de `app.UseAuthentication()`. Após corrigir, reinicie a API.

**Cadastrei uma OS como Concluída mas não apareceu no relatório de faturamento.**  
O relatório só computa OS que têm o campo **Valor Final** preenchido. Ao atualizar o status para `Concluida`, certifique-se de informar o valor final no modal.

**Fui redirecionado para o login de repente. O que aconteceu?**  
O token JWT expira em 8 horas. Quando isso ocorre, o sistema detecta a resposta 401 da API, exibe um aviso e redireciona automaticamente. Basta fazer login novamente.

**Como cadastrar um veículo sem ter um cliente cadastrado antes?**  
No modal de cadastro de veículo, se não houver clientes, um aviso aparece automaticamente com a opção de cadastrar um cliente inline — sem precisar trocar de tela. Após salvar o cliente, ele já fica vinculado ao veículo.

**Por que o projeto usa SQLite e não SQL Server ou PostgreSQL?**  
SQLite foi escolhido para simplificar o setup local — não requer instalação de servidor de banco. Para um ambiente de produção, basta trocar a connection string e o provider do EF Core.

---

## Próximos passos

- [ ] Docker / docker-compose para facilitar o setup
- [ ] Deploy com CI/CD

---

## Autor

Desenvolvido por mim, como projeto de portfólio.
