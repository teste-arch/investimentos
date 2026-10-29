# Screener de Valuation (B3 & Bolsa Americana)

> **Aviso Legal:** Ferramenta de estudo, não é recomendação de investimento.

Aplicação web completa para cálculo de Preço Teto, Rankings e Análise Fundamentalista de ações da bolsa brasileira (B3) e mercado americano (EUA). Desenvolvida em React 19 + TypeScript + Vite + Tailwind CSS no frontend, com backend Node.js adaptado para Vercel Serverless Functions e banco de dados **Supabase**.

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
- **Armazenamento Externo:** Armazenamento em nuvem via **Supabase** (PostgreSQL REST), com fallback em memória para desenvolvimento local.
- **Cache Inteligente:** TTL de 24h para fundamentos e 30 min para cotações. Contador diário de requisições de API visível.
- **Rankings Configuráveis:** Por Bazin, Graham, Lynch, Greenblatt (excluindo bancos/financeiras) e Ranking Combinado.
- **Filtros Fundamentalistas:** P/L (3 a 15), DL/EBITDA (máx 5x), ROE (mín 10%) e liquidez diária mínima.
- **Proteção por Senha & Anti-Brute-Force:** Autenticação no site via `SITE_PASSWORD` com limitação de tentativas e bloqueio temporário por 15 minutos em caso de ataques.
- **Rotina Diária Agendada:** Endpoint `/api/cron` protegido por `CRON_SECRET` executando atualização em lotes via Vercel Cron.

---

## 🗄️ Configuração da Tabela no Supabase

Cole o SQL abaixo no **SQL Editor** do Supabase para criar a tabela de cache com Row Level Security (RLS) ativado:

```sql
-- 1. Criação da tabela de chave-valor para o cache do screener
CREATE TABLE IF NOT EXISTS screener_kv (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ativação obrigatória do Row Level Security (RLS)
ALTER TABLE screener_kv ENABLE ROW LEVEL SECURITY;

-- 3. Nenhuma política pública criada: o acesso fica 100% restrito
-- ao servidor backend utilizando a SUPABASE_SECRET_KEY (service_role).
```

---

## ⚙️ Variáveis de Ambiente

As variáveis do **Supabase** já são preenchidas automaticamente pela integração da Vercel (`NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY`).

Você só precisa adicionar manualmente na Vercel:

```env
# Senha de proteção simples para o site
SITE_PASSWORD=sua_senha_aqui

# Segredo de autorização para o Vercel Cron (/api/cron)
CRON_SECRET=seu_segredo_cron_aqui

# APIs de Mercado
BRAPI_API_KEY=seu_token_brapi
FMP_API_KEY=sua_chave_fmp
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
