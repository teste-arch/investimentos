# Screener de Valuation (B3 & Bolsa Americana)

> **Aviso Legal:** Ferramenta de estudo, não é recomendação de investimento.

Aplicação web completa para cálculo de Preço Teto, Rankings e Análise Fundamentalista de ações da bolsa brasileira (B3) e mercado americano (EUA). Desenvolvida em React 19 + TypeScript + Vite + Tailwind CSS no frontend, com backend Node.js adaptado para Vercel Serverless Functions.

---

## 🌟 Funcionalidades

### 1. Calculadoras Manuais (Fase 1)
- **Décio Bazin:** Teto = Dividendo por Ação (DPA 12m ou média de 5 anos) ÷ Taxa exigida (padrão 6%, editável).
- **Benjamin Graham:** Preço Justo = $\sqrt{22,5 \times LPA \times VPA}$. Validação estrita: exibe *"Não se aplica"* para empresas com LPA ou patrimônio negativo.
- **Peter Lynch:** PEG ratio, Preço Teto ($LPA \times \text{Crescimento}$) e Score Lynch ($(\text{Crescimento} + DY) \div P/L$) com classificação visual (Bom $> 2$, Razoável $1\text{--}2$, Ruim $< 1$).
- **Joel Greenblatt (Fórmula Mágica):** Earnings Yield ($EBIT \div EV$) e ROIC Tangível ($EBIT \div [\text{Giro Líquido} + \text{Imobilizado}]$).
- **DCF Simplificado:** Fluxo de Caixa Descontado em 2 estágios projetando os Anos 1 a 5 a valor presente via WACC, Valor Terminal de Gordon descontado, dedução da Dívida Líquida e teto por ação.
- **Margem de Segurança:** Preço de Compra = Teto $\times (1 - \text{Margem})$ em todas as calculadoras.
- **Comparador Unificado:** Visão consolidada calculando todos os tetos e extraindo a média consensual.

### 2. Dados Automáticos & Rankings (Fase 2)
- **Provedores de Mercado:**
  - B3: `brapi.dev`
  - EUA: `Financial Modeling Prep (FMP)`
  - Camada trocável (`ProviderRegistry`) para alternância de fontes de dados.
- **Armazenamento Externo:** Suporte a **Upstash Redis** (Vercel KV via REST HTTP) e **Supabase** (PostgreSQL via REST).
- **Cache Inteligente:** TTL de 24h para fundamentos e 30 min para cotações. Contador diário de requisições de API visível.
- **Rankings Configuráveis:** Por Bazin, Graham, Lynch, Greenblatt (excluindo bancos/financeiras) e Ranking Combinado.
- **Filtros Fundamentalistas:** P/L (3 a 15), DL/EBITDA (máx 5x), ROE (mín 10%) e liquidez diária mínima.
- **Proteção por Senha:** Tela de login opcional via `SITE_PASSWORD`.
- **Rotina Diária Agendada:** Endpoint `/api/cron` protegido por `CRON_SECRET` executando atualização em lotes via Vercel Cron.

---

## ⚙️ Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env` (ou no painel da Vercel):

```env
# Segurança
SITE_PASSWORD=sua_senha_aqui
CRON_SECRET=seu_segredo_cron_aqui

# APIs de Mercado
BRAPI_API_KEY=seu_token_brapi
FMP_API_KEY=sua_chave_fmp

# Armazenamento Externo (Recomendado na Vercel)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# ou Supabase:
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor backend (porta 3001)
npm run server

# 3. Em outro terminal, iniciar frontend (porta 5173)
npm run dev
```

Acesse: `http://localhost:5173/`

---

## ☁️ Deploy na Vercel

1. Importe este repositório na [Vercel](https://vercel.com).
2. Configure as **Environment Variables** listadas no `.env.example`.
3. Clique em **Deploy**. A rotina agendada no `vercel.json` rodará de segunda a sexta às 21:00 UTC (18:00 BRT).
