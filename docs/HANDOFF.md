# Ryze CRM — Documento de Entrega

Este documento descreve arquitetura, autenticacao/permissoes, variaveis de ambiente,
postura de seguranca e limitacoes conhecidas do sistema, para quem for assumir o
projeto.

## Visao geral

Ryze CRM (nome interno no codigo: `orbit-leads`) e um SaaS de prospeccao B2B:
busca empresas no Google Maps via Apify, filtra oportunidades, organiza leads em
um CRM Kanban, gera mensagens personalizadas e documentos comerciais (proposta,
contrato, orcamento) e exporta listas para operacao comercial.

- Stack: Next.js 15 (App Router) + React 19 + TypeScript, Tailwind CSS, Prisma
  + PostgreSQL, NextAuth (credenciais), Apify API.
- Deploy: Vercel, banco Postgres gerenciado pela Neon (integracao nativa da
  Vercel).
- Tema: escuro apenas (identidade visual da Ryze Agency). Nao ha modo claro.

## Arquitetura

```txt
app/            Rotas (paginas) e rotas de API (app/api/**/route.ts)
components/     UI, layout, formularios, graficos
lib/            Prisma client, NextAuth, RBAC/permissoes, utilitarios
prisma/         schema.prisma, migrations/, seed.ts
repositories/   Acesso a dados paginado (ex.: LeadRepository)
services/       Apify, IA (scoring local), CRM, documentos, automacao, WhatsApp
middleware.ts   Gate de autenticacao para PAGINAS (nao cobre /api, ver abaixo)
```

Next.js roda como monolito: frontend e API sao a mesma aplicacao, mesma origem.
Nao ha CORS configurado porque nao e necessario — nenhum cliente externo (app
mobile, outro dominio) consome essa API hoje. Se isso mudar no futuro, adicionar
headers CORS explicitos em `next.config.ts` restritos ao(s) dominio(s) confiavel(is).

## Autenticacao e permissoes (RBAC)

Login por credenciais (NextAuth), sessao JWT assinada por `NEXTAUTH_SECRET`.

Papeis (`UserRole` no Prisma): `ADMIN`, `SELLER`, `FINANCE`.

Matriz de permissoes (`lib/permissions.ts`, fonte unica usada tanto no backend
quanto no filtro do menu lateral no frontend):

| Permissao          | ADMIN | SELLER | FINANCE |
|---------------------|:-----:|:------:|:-------:|
| leads:read           | x | x | x |
| leads:update         | x | x |   |
| searchJobs:create    | x | x |   |
| searchJobs:read      | x | x |   |
| team:read            | x |   | x |
| team:write           | x |   |   |
| settings:read        | x |   | x |
| settings:write       | x |   |   |
| exports:create       | x | x | x |
| audit:read           | x |   | x |

Toda rota de API que le ou muta dado sensivel chama `requirePermission(permissao)`
(`lib/rbac.ts`), que:

1. Resolve o usuario da sessao (`getServerSession`).
2. Confere a permissao contra a matriz acima.
3. Lanca `RbacError(401)` sem sessao, `RbacError(403)` sem permissao.

**Importante:** o `middleware.ts` (que redireciona para `/login`) so cobre
**paginas** — o matcher exclui `/api` explicitamente. Isso significa que
**toda rota nova em `app/api/**/route.ts` precisa chamar `requirePermission(...)`
manualmente**, ou ela fica publica por padrao. Isso ja causou uma falha real
corrigida nesta entrega (ver secao "Seguranca" abaixo) — ao criar rotas novas,
siga o padrao ja usado em `app/api/leads/route.ts` ou `app/api/team/route.ts`.

O menu lateral (`components/layout/app-shell.tsx`) usa a mesma matriz para
esconder links que o papel do usuario nao pode de fato usar (ex.: vendedor nao
ve "Equipe", "Configuracoes" nem "Historico").

### Fallback de demonstracao

`getCurrentUser()` em `lib/rbac.ts` tem um fallback que confia no `role` do
JWT da sessao (sem reconsultar o banco) quando: o `DATABASE_URL` nao esta
configurado, `NODE_ENV !== "production"`, ou o usuario e um dos IDs de demo
(`development-admin-davi`, `demo-user-*`). Isso existe para permitir
demonstracao sem banco configurado. Em producao com `DATABASE_URL` presente
(caso atual), esse fallback so age se a query ao Postgres falhar. E um
comportamento intencional, mas vale saber que existe.

## RLS (Row Level Security) e Supabase

Este projeto **nao usa Supabase** e o Postgres **nunca e acessado direto pelo
navegador** — sempre passa pelo backend Next.js via Prisma, atras dos guards de
`requirePermission`. RLS no Postgres protegeria acesso *direto* ao banco (ex.:
um client-side Supabase SDK usando a anon key), o que nao acontece aqui. Se no
futuro alguma parte da aplicacao passar a falar direto com o Postgres/Supabase
do navegador, RLS passa a ser necessario — hoje seria redundante com o RBAC do
backend.

## Variaveis de ambiente

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `DATABASE_URL` | Sim | Connection string do Postgres (Neon). Ja configurada na Vercel via integracao. |
| `NEXTAUTH_URL` | Sim (producao) | URL publica do deploy. |
| `NEXTAUTH_SECRET` | Sim | Chave para assinar sessoes JWT. Sem ela, cai num fallback inseguro fixo no codigo — **nunca deixar vazio em producao**. |
| `APIFY_TOKEN` | Sim para busca real | Token da conta Apify usada para rodar o actor do Google Maps. |
| `APIFY_GOOGLE_MAPS_ACTOR_ID` | Nao | Actor da Apify (padrao `compass~crawler-google-places`). |
| `OPENAI_API_KEY` | Nao | Ainda nao usada — IA roda com heuristica local (`services/ai/`). |
| `ORBIT_ADMIN_LOGIN` / `ORBIT_ADMIN_EMAIL` / `ORBIT_ADMIN_PASSWORD` | Usadas pelo seed | Credenciais do usuario admin inicial. |
| `SEED_ADMIN_*` | Usadas pelo seed | Mesma finalidade, usadas por `prisma/seed.ts`. |
| `SMTP_*` | Nao | Nao implementado ainda. |
| `LOGO_STORAGE_*` | Nao | Upload de logo externo (Cloudinary/S3/etc.), nao configurado. |

Todas ja estao configuradas na Vercel (Production/Preview/Development) exceto
`OPENAI_API_KEY` e as variaveis de `LOGO_STORAGE_*`/`SMTP_*`, que nao sao
usadas ainda.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencher com os valores reais
npm run prisma:generate
npx prisma migrate deploy   # aplica as migrations existentes (nao criar novas com --name a toa)
npm run db:seed             # so na primeira vez, cria o admin inicial
npm run dev
```

## Seguranca — o que foi corrigido nesta entrega

1. **Rotas de API publicas sem querer.** `app/api/leads`, `app/api/leads/[id]`,
   `app/api/dashboard/metrics`, `app/api/crm/kanban`, `app/api/ai/analyze`,
   `app/api/ai/message`, `app/api/documents/{contract,proposal,quote}`,
   `app/api/cities` e `app/api/categories` nao chamavam `requirePermission`.
   Como o middleware nao cobre `/api`, qualquer pessoa com a URL lia dados reais
   sem login — confirmado ao vivo antes da correcao. Todas agora exigem sessao
   e a permissao adequada.
2. **`NEXTAUTH_SECRET` ausente em producao**, o que fazia o app cair num
   segredo fixo hardcoded (`lib/auth-secret.ts`). Gerado e configurado um
   segredo forte na Vercel.
3. **Senha do admin inicial** estava com o valor de exemplo do
   `.env.example` (`troque-esta-senha`) no banco de producao. Trocada por uma
   senha forte gerada aleatoriamente.
4. **Menu lateral mostrava links que o papel do usuario nao pode usar**
   (a API ja bloqueava, mas a pagina abria vazia/quebrada). Corrigido para
   esconder o link quando o papel nao tem a permissao correspondente.

## Limitacoes conhecidas (nao sao bugs, sao features nao implementadas)

- **Financeiro** (`/financeiro`): tela existe mas os dados sao um array vazio
  fixo no componente (`components/finance/finance-overview.tsx`). Sem API,
  sem persistencia.
- **Campanhas** (`/campanhas`): mesma situacao, placeholder intencional
  ("area limpa para apresentacao" no proprio codigo). Sem API.
- **IA** (`services/ai/`): score e mensagens sao gerados por heuristica local,
  nao por um LLM. A estrutura ja esta pronta para plugar OpenAI quando
  `OPENAI_API_KEY` for configurada.
- **Upload de logo**: espera um provedor de storage externo configurado via
  `LOGO_STORAGE_*`; sem isso, fica limitado.
- **Testes automatizados**: existe `npm run test` (Node test runner), mas a
  cobertura e parcial — nao ha testes para as rotas de API corrigidas nesta
  entrega. Recomenda-se adicionar testes de integracao (200 autenticado,
  401 sem sessao, 403 com papel errado) antes de novas mudancas em `app/api`.

## Proximos passos recomendados

1. Adicionar testes automatizados para as rotas de API (RBAC e regressao).
2. Decidir se Financeiro/Campanhas vao virar features reais ou saem do menu.
3. Configurar `OPENAI_API_KEY` se quiser IA real em vez da heuristica local.
4. Definir dominio proprio (hoje o deploy usa `project-orbit-sand.vercel.app`).
5. Revisar rotacao de segredos (`NEXTAUTH_SECRET`, `APIFY_TOKEN`) periodicamente.
