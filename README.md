# Orbit Leads

Orbit Leads e um SaaS premium de prospeccao para agencias de marketing. O produto foi desenhado para encontrar empresas no Google Maps, filtrar oportunidades comerciais, organizar leads por categoria/cidade, criar mensagens personalizadas e exportar listas prontas para operacao comercial.

## Stack

- Next.js 15 com App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- Lucide Icons
- Framer Motion
- NextAuth
- Prisma
- PostgreSQL
- XLSX
- pdf-lib
- Apify API para Google Maps

## Estrutura

```txt
app/                  Rotas do Next.js e API routes
components/           Layout, UI, formularios, graficos e tabela de leads
data/                 Dados iniciais para categorias, cidades e mock premium
hooks/                Hooks reutilizaveis
lib/                  Prisma, auth e utilitarios base
models/               Mapeamentos de dominio
prisma/               Schema e seed
repositories/         Acesso a dados e consultas paginadas
services/             Apify, filtros, exportacao e WhatsApp
types/                Tipos TypeScript globais
utils/                Formatadores e normalizadores
```

## Instalacao

```bash
cd orbit-leads
npm install
cp .env.example .env
```

Edite o `.env` com os dados reais:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orbit_leads?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-segura"
APIFY_TOKEN="apify_api_xxx"
APIFY_GOOGLE_MAPS_ACTOR_ID="compass/crawler-google-places"
OPENAI_API_KEY=""
SMTP_HOST=""
SMTP_USER=""
SMTP_PASSWORD=""
SEED_ADMIN_NAME="Davi"
SEED_ADMIN_EMAIL="davi@orbit.local"
SEED_ADMIN_PASSWORD="troque-esta-senha"
ORBIT_ADMIN_LOGIN="Davi"
ORBIT_ADMIN_EMAIL="davi@orbit.local"
ORBIT_ADMIN_PASSWORD="troque-esta-senha"
```

## Banco PostgreSQL

Crie o banco:

```bash
createdb orbit_leads
```

Gere o Prisma Client, rode a migration e alimente os dados iniciais:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
```

O seed cria:

- usuario admin inicial
- categorias iniciais
- cidades iniciais do Sul de Minas
- mensagem padrao
- configuracoes da empresa
- leads demonstrativos
- regras de automacao iniciais

## Login

Com o seed padrao:

```txt
Login: Davi
Senha: definida em `ORBIT_ADMIN_PASSWORD` no ambiente de deploy ou no seed local.

Em desenvolvimento, se o PostgreSQL ainda nao estiver rodando, o login acima tambem funciona como fallback local para apresentacao. Em producao, crie o usuario real com o seed e mantenha o banco PostgreSQL ativo.
```

Em producao, troque a senha imediatamente e gere um `NEXTAUTH_SECRET` forte.

## Apify

O servico fica em `services/apify.service.ts`.

Fluxo:

1. Recebe filtros de estado, cidade, categoria, quantidade maxima, nota minima e avaliacoes.
2. Inicia um run na Apify.
3. Aguarda o dataset finalizar.
4. Normaliza os campos do Google Maps.
5. Aplica filtros locais.
6. Salva leads no PostgreSQL.
7. Registra a busca no historico.

Campos salvos:

- nome
- telefone
- endereco
- cidade
- estado
- site
- Instagram
- Google Maps
- categoria
- nota
- quantidade de avaliacoes
- latitude
- longitude
- WhatsApp
- status

O actor pode ser trocado por `.env` usando `APIFY_GOOGLE_MAPS_ACTOR_ID`.

## Exportacao

Rotas:

```txt
GET /api/leads/export?format=xlsx
GET /api/leads/export?format=csv
```

O XLSX cria uma aba por categoria e uma aba `Todos`.

## WhatsApp

O sistema nao envia mensagens automaticamente. Ele gera links seguros:

```txt
https://wa.me/55NUMERO?text=MENSAGEM
```

O helper fica em `services/whatsapp.service.ts` e suporta variaveis:

- `{empresa}`
- `{cidade}`
- `{categoria}`

## Rotas principais

- `/login`
- `/dashboard`
- `/inteligencia`
- `/buscar-leads`
- `/leads`
- `/crm`
- `/mapa`
- `/categorias`
- `/cidades`
- `/mensagens`
- `/campanhas`
- `/automacoes`
- `/financeiro`
- `/relatorios`
- `/exportacoes`
- `/historico`
- `/equipe`
- `/configuracoes`

## Mobile e PWA

O Orbit Leads esta preparado para apresentacao em celular:

- viewport bloqueado para evitar zoom acidental
- campos com fonte minima adequada para iOS nao aproximar ao focar
- selecao, copia e menu de contexto bloqueados em dispositivos moveis
- barra inferior de navegacao para uso no celular
- manifest PWA em `public/manifest.webmanifest`
- service worker em `public/sw.js`
- logo Orbit como favicon, Apple Touch Icon e icones PWA

Para instalar no celular, abra o site no navegador e use `Adicionar a tela inicial`. O app aparece como aplicativo, mas continua sendo o site.

## API

- `GET /api/leads`
- `POST /api/leads/search`
- `PATCH /api/leads/:id/status`
- `GET /api/leads/export`
- `POST /api/ai/analyze`
- `POST /api/ai/message`
- `GET /api/crm/kanban`
- `GET /api/dashboard/metrics`
- `POST /api/documents/proposal`
- `POST /api/documents/contract`
- `POST /api/documents/quote`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/cities`
- `POST /api/cities`
- `GET /api/settings`
- `PATCH /api/settings`
- `/api/auth/*`

## Deploy na Vercel

1. Suba o projeto para o GitHub.
2. Crie um banco PostgreSQL gerenciado, como Neon, Supabase, Railway ou Vercel Postgres.
3. Configure as variaveis na Vercel:

```env
DATABASE_URL=
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=
APIFY_TOKEN=
APIFY_GOOGLE_MAPS_ACTOR_ID=
```

4. Rode a migration no ambiente de producao:

```bash
npx prisma migrate deploy
```

5. Gere seed apenas se desejar criar a conta inicial:

```bash
npm run db:seed
```

## Qualidade visual

O design foi pensado para parecer um SaaS vendido para empresas:

- tema claro por padrao
- dark mode
- sidebar densa e moderna
- cards de metricas
- graficos
- tabela com busca, filtros e ordenacao
- editor de mensagens
- exportacao
- animacoes suaves
- layout responsivo

## Arquitetura de evolucao premium

A evolucao para SaaS foi separada em camadas:

- `repositories/`: consultas paginadas e otimizadas para suportar bases grandes.
- `services/ai/`: analise de empresas, score de potencial e mensagens unicas.
- `services/crm/`: pipeline Kanban, valores potenciais e metricas comerciais.
- `services/documents/`: propostas, contratos e orcamentos em PDF.
- `services/automation/`: regras de automacao e cadencia de follow-up.

A IA atual usa um motor local de scoring para funcionar sem dependencia externa. A estrutura ja deixa o provider pronto para OpenAI quando `OPENAI_API_KEY` estiver configurado.

## Proximas etapas recomendadas

1. Conectar a tabela de leads ao endpoint real em vez do mock local.
2. Adicionar RBAC completo para equipe.
3. Criar pagina de detalhe do lead.
4. Adicionar importacao manual de planilhas.
5. Criar fila de buscas Apify com status em tempo real.
6. Adicionar logs de auditoria por usuario.
7. Implementar upload de logo em storage externo.
8. Adicionar testes automatizados para filtros, exportacao e WhatsApp.
