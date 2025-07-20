# Finance Lisboa Family

Uma aplicação full-stack para controle de finanças pessoais, migrada de JS para TypeScript no backend e migrada do front-end estático em JavaScript para react typescript.

## 🚀 Estado Atual

• Backend em **TypeScript** (`src/`):  
  - API REST com Express + Mongoose  
  - Autenticação JWT (middleware `auth.ts`)  
  - CRUD de Usuários, Transações e Categorias  
  - Endpoint de resumo de gastos por categoria (`/api/dashboard`)  
  - Validação de entrada com `express-validator`  
  - Estrutura `controller → service (ainda a evoluir) → model`  
  - Configurado para build (`npm run build`) e dev (`npm run dev`)  

• Front-end estático em **JavaScript** (`public/`):  
  - Páginas de login, dashboard e cadastro  
  - Chamada à API via `fetch`, token em `localStorage`  
  - Layout básico, sem framework  

📌 Roadmap / Próximas Entregas

• Front-end:  
  - Páginas de login, dashboard e cadastro  
  - Gráficos de gastos (Chart.js, ApexCharts ou similar)
  - Layout responsivo e refatoração em módulos ES6
  - (Opcional) Migração para React ou Angular

• Backend:  
  - Camada de services e injeção de dependência
  - Tratamento global de erros e DTOs com class-validator
  - Cache Redis para endpoints de resumo
  - Testes unitários (Jest) e de integração (Supertest / mongodb-memory-server)
  - Documentação OpenAPI/Swagger
  - Docker + docker-compose (API, MongoDB, Redis)
  - CI/CD (GitHub Actions): lint → build → testes → deploy

• Segurança & Performance:  
  - Http-only cookies + CSRF
  - Rate limiting por rota/IP
  - Índices Mongo e paginação cursor-based
  - Logs estruturados (Pino/Winston) e métricas Prometheus


Contribuições são bem-vindas!
Abra issues para bugs ou sugestões e envie PRs para novos recursos.

