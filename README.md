# Finance Lisboa Family

Uma aplicação full-stack com login e dashboard para controle de finanças pessoais, com backend em TypeScript (Node.js, Express) e frontend em React + TypeScript.

## Estado Atual

### Backend (`/Backend`)
• API REST com Express + Mongoose  
• Autenticação JWT (middleware `auth.ts`)  
• CRUD de Usuários, Transações e Categorias  
• Endpoint de resumo de gastos por categoria (`/api/dashboard`)  
• Middlewares de segurança: Helmet (CSP), CORS, rate limiting  
• Configuração com dotenv para variáveis de ambiente  
• TypeScript com ts-node-dev e build via tsc  
• Estrutura controller → service → model  

### Frontend (`/Frontend`)
• Aplicação React com TypeScript, Vite e ESLint  
• React Router para navegação (Login, Registro, Dashboard, Transações)  
• Chamada à API com Axios e token em localStorage  
• Visualização de dados com Recharts (gráficos de despesas e receitas)  
• Estilização com Tailwind CSS  
• Layout responsivo e modularizado  

## Roadmap / Próximas Entregas

### Frontend
• Otimizações de build e performance  
• Melhorias de UX/UI e acessibilidade  

### Backend
• Camada completa de services e injeção de dependência  
• Tratamento global de erros e validação com class-validator  
• Cache Redis para endpoints críticos  
• Testes unitários e de integração (Jest, Supertest)  
• Documentação OpenAPI/Swagger  
• Docker + docker-compose (API, MongoDB, Redis)  
• CI/CD com GitHub Actions  

## Contribuições
Contribuições são bem-vindas! Abra issues para bugs ou sugestões e envie PRs.  
