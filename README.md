# Sistema de Gestão de Funcionários e Contratos

Aplicação monolito para gerenciar funcionários e contratos de uma empresa de engenharia, construída como teste técnico.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Backend** | NestJS (CommonJS) + Fastify + Prisma ORM |
| **Frontend** | Vue 3 + TypeScript + Pinia + Vue Router |
| **Banco de Dados** | PostgreSQL 16 |
| **Containerização** | Docker + Docker Compose |
| **Testes** | Jest (backend) + Vitest (frontend) |

## Estrutura do Projeto

```
projeto/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── common/          # DTOs, filters, pipes, utils
│   │   ├── modules/
│   │   │   ├── funcionario/ # CRUD funcionários
│   │   │   ├── contrato/    # CRUD contratos
│   │   │   └── vinculo/     # Gestão N:N contratos-funcionários
│   │   ├── prisma/          # PrismaModule (global)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma    # Schema do banco
│   │   └── seed.ts          # Dados de exemplo
│   └── test/                # Testes unitários
├── frontend/                # SPA Vue 3
│   ├── src/
│   │   ├── services/        # Camada de API HTTP
│   │   ├── stores/          # Pinia stores
│   │   ├── views/           # Telas (listas + formulários)
│   │   ├── router/          # Vue Router
│   │   └── components/
│   └── test/                # Testes de componentes/stores
├── docker-compose.yml
└── .env.example
```

## Como Executar

### Com Docker (Recomendado)

```bash
# Subir toda a stack (banco + backend + frontend)
docker compose up --build -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

Serviços disponíveis:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (user: postgres, pass: postgres, db: engenharia)

### Sem Docker (Desenvolvimento)

**Pré-requisitos**: Node.js 22+, PostgreSQL 16+

```bash
# Backend
cd backend
cp .env.example .env  # Ajuste DATABASE_URL se necessário
npm install
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run start:dev

# Frontend (novo terminal)
cd frontend
cp .env.example .env  # Ajuste VITE_API_URL se necessário
npm install
npm run dev
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=engenharia
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/engenharia

# App
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
```

## Endpoints Principais

### Funcionários (`/api/funcionarios`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Criar funcionário |
| GET | `/` | Listar (paginado, filtros: `search`, `departamento`, `contratoId`, `page`, `limit`) |
| GET | `/:id` | Buscar por ID |
| PATCH | `/:id` | Atualizar |
| DELETE | `/:id` | Excluir |

**Campos do funcionário**: `nome`, `cpf` (único, validado com dígitos verificadores), `email` (único), `departamento` (string, valores: Engenharia Civil, Elétrica, Mecânica, Segurança do Trabalho, Administrativo)

### Contratos (`/api/contratos`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Criar contrato |
| GET | `/` | Listar (paginado, filtros: `search`, `status`, `page`, `limit`) - retorna `_count.funcionarios` |
| GET | `/:id` | Buscar por ID (inclui funcionários vinculados) |
| PATCH | `/:id` | Atualizar |
| DELETE | `/:id` | Excluir |

**Campos do contrato**: `nome`, `descricao`, `status` (enum: ATIVO, ENCERRADO, SUSPENSO)

### Vínculos (`/api/contratos/:id/funcionarios`)

| Método | Rota | Descrição |
|--------|------|-----------|
| PUT | `/` | Substituir lista completa de funcionários (`{ funcionarioIds: string[] }`) |
| POST | `/:funcionarioId` | Adicionar funcionário |
| DELETE | `/:funcionarioId` | Remover funcionário |

**Decisão**: Usa `PUT` para substituir a lista completa — idempotente, evita race conditions e simplifica o frontend (um único componente de multi-select).

## Modelo de Dados

```prisma
enum StatusContrato { ATIVO, ENCERRADO, SUSPENSO }

model Funcionario {
  id           String      @id @default(uuid())
  nome         String
  cpf          String      @unique
  email        String      @unique
  departamento String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  contratos    ContratoFuncionario[]
  @@map("funcionarios")
}

model Contrato {
  id           String      @id @default(uuid())
  nome         String
  descricao    String
  status       StatusContrato @default(ATIVO)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  funcionarios ContratoFuncionario[]
  @@map("contratos")
}

model ContratoFuncionario {
  contratoId    String
  funcionarioId String
  vinculadoEm   DateTime @default(now())
  contrato      Contrato    @relation(fields: [contratoId], references: [id], onDelete: Cascade)
  funcionario   Funcionario @relation(fields: [funcionarioId], references: [id], onDelete: Cascade)
  @@id([contratoId, funcionarioId])
  @@map("contrato_funcionarios")
}
```

**Regras de integridade**:
- CPF e e-mail únicos (409 se duplicado)
- CPF validado com algoritmo dos dígitos verificadores
- Vínculo N:N com PK composta (`contratoId`, `funcionarioId`)
- `onDelete: Cascade` apenas na tabela pivô (excluir funcionário/contrato remove vínculos, nunca o outro lado)
- Contagem de funcionários via `_count` do Prisma (sem N+1)

## Testes

### Backend (Jest)

```bash
cd backend
npm test           # Unitários
npm run test:cov   # Com coverage
npm run test:e2e   # E2E (requer banco rodando)
```

**Cobertura**: CPF validator, pagination DTOs, services principais (regras de duplicidade, vínculos).

### Frontend (Vitest)

```bash
cd frontend
npm run test:unit  # Componentes + stores
```

**Cobertura**: Pinia stores (funcionario, contrato), App.vue.

## Decisões de Arquitetura

| Assunto | Decisão | Justificativa |
|---------|---------|---------------|
| **Organização backend** | Módulos por domínio (funcionario, contrato, vinculo) | Estilo Laravel, controllers finos, services com regra de negócio |
| **Validação** | Backend como fonte da verdade (`class-validator` + pipes global) | Segurança; frontend valida apenas para UX |
| **Tratamento de erros** | Global `HttpExceptionFilter` + `ValidationPipe` | Formato único: `{ statusCode, message, error, timestamp, path }` |
| **Paginação** | `page`, `limit`, `total`, `totalPages` no backend | Padrão REST, frontend consome diretamente |
| **Departamento** | String com `@IsIn([...validos])` | Simples, permite filtro, evita migração de enum no banco |
| **Vínculos** | `PUT /contratos/:id/funcionarios` | Idempotente, substitui lista atômica em transação |
| **Prisma 7** | Driver adapter (`@prisma/adapter-pg`) + `prisma.config.ts` | Requisito da versão 7.x |

## O que Melhoraria com Mais Tempo

1. **Autenticação/Autorização** — JWT + roles (admin, gestor, visualizador)
2. **Testes E2E completos** — Supertest para todos os endpoints críticos
3. **Validação de CPF no frontend** — Máscara e validação client-side
4. **Internacionalização (i18n)** — Preparar para múltiplos idiomas
5. **Logs estruturados** — Pino/Winston + correlation IDs
6. **Documentação OpenAPI** — Swagger UI em `/api/docs`
7. **Cache** — Redis para listagens frequentes
8. **Auditoria** — Trigger/history table para mudanças sensíveis
9. **CI/CD** — GitHub Actions com lint, test, build, deploy
10. **Frontend polido** — Toast notifications, loading skeletons, acessibilidade (ARIA)

## Licença

UNLICENSED — Teste técnico.