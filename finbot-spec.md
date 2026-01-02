# 🤖 FinBot - Agente Financeiro Pessoal

## Visão Geral

Sistema de controle financeiro pessoal com bot Telegram para lançamentos via linguagem natural e painel web completo para gestão e visualização de finanças.

## Stack Tecnológica

- **Backend**: Node.js + Express + TypeScript
- **Bot**: node-telegram-bot-api
- **IA**: Claude API (Anthropic) para interpretação de mensagens
- **Banco de Dados**: MySQL
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Hospedagem**: VPS Linux

---

## Estrutura de Pastas

```
finbot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── transactionController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── budgetController.ts
│   │   │   ├── investmentController.ts
│   │   │   ├── reportController.ts
│   │   │   └── dashboardController.ts
│   │   ├── services/
│   │   │   ├── aiService.ts          # Integração com Claude API
│   │   │   ├── telegramService.ts    # Bot Telegram
│   │   │   ├── alertService.ts       # Alertas de gastos
│   │   │   └── reportService.ts      # Geração de relatórios
│   │   ├── models/
│   │   │   ├── Transaction.ts
│   │   │   ├── Category.ts
│   │   │   ├── Budget.ts
│   │   │   ├── Investment.ts
│   │   │   └── CashFlow.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── transactions.ts
│   │   │   ├── categories.ts
│   │   │   ├── budgets.ts
│   │   │   ├── investments.ts
│   │   │   ├── reports.ts
│   │   │   └── dashboard.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   ├── dateUtils.ts
│   │   │   └── formatters.ts
│   │   ├── bot/
│   │   │   ├── index.ts
│   │   │   ├── handlers/
│   │   │   │   ├── messageHandler.ts
│   │   │   │   ├── commandHandler.ts
│   │   │   │   └── callbackHandler.ts
│   │   │   └── keyboards/
│   │   │       └── inlineKeyboards.ts
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── BalanceCard.tsx
│   │   │   │   ├── IncomeExpenseChart.tsx
│   │   │   │   ├── CategoryPieChart.tsx
│   │   │   │   ├── MonthlyTrendChart.tsx
│   │   │   │   ├── RecentTransactions.tsx
│   │   │   │   └── BudgetProgress.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   └── TransactionFilters.tsx
│   │   │   ├── categories/
│   │   │   │   ├── CategoryList.tsx
│   │   │   │   └── CategoryForm.tsx
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetList.tsx
│   │   │   │   └── BudgetForm.tsx
│   │   │   ├── investments/
│   │   │   │   ├── InvestmentList.tsx
│   │   │   │   ├── InvestmentForm.tsx
│   │   │   │   └── InvestmentChart.tsx
│   │   │   ├── cashflow/
│   │   │   │   ├── CashFlowSummary.tsx
│   │   │   │   └── CashFlowChart.tsx
│   │   │   └── reports/
│   │   │       ├── MonthlyReport.tsx
│   │   │       ├── CategoryReport.tsx
│   │   │       └── ExportButtons.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Budgets.tsx
│   │   │   ├── Investments.tsx
│   │   │   ├── CashFlow.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useTransactions.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useBudgets.ts
│   │   │   └── useDashboard.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── database/
    └── schema.sql
```

---

## Schema MySQL

```sql
-- Configurações do banco
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TABELA: categories (Categorias de transações)
-- =====================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense', 'investment') NOT NULL,
    icon VARCHAR(50) DEFAULT 'circle',
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_category_name_type (name, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: transactions (Transações - receitas e despesas)
-- =====================================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(500),
    category_id INT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'telegram', 'import'
    telegram_message_id BIGINT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency ENUM('daily', 'weekly', 'monthly', 'yearly'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_transactions_date (date),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: budgets (Orçamentos por categoria)
-- =====================================================
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    month INT NOT NULL, -- 1-12
    year INT NOT NULL,
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00, -- % para alertar
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE KEY uk_budget_category_period (category_id, month, year),
    INDEX idx_budgets_period (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: investments (Investimentos)
-- =====================================================
CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('stocks', 'fixed_income', 'funds', 'crypto', 'real_estate', 'savings', 'other') NOT NULL,
    institution VARCHAR(200), -- Corretora/Banco
    ticker VARCHAR(20), -- Código do ativo (PETR4, BTC, etc)
    quantity DECIMAL(18, 8), -- Quantidade (permite frações para cripto)
    purchase_price DECIMAL(15, 2), -- Preço de compra unitário
    current_price DECIMAL(15, 2), -- Preço atual unitário
    total_invested DECIMAL(15, 2) NOT NULL, -- Valor total investido
    current_value DECIMAL(15, 2), -- Valor atual total
    purchase_date DATE NOT NULL,
    maturity_date DATE, -- Data de vencimento (para renda fixa)
    expected_return DECIMAL(8, 4), -- Rentabilidade esperada (% a.a.)
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_investments_type (type),
    INDEX idx_investments_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: investment_transactions (Movimentações de investimentos)
-- =====================================================
CREATE TABLE investment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investment_id INT NOT NULL,
    type ENUM('buy', 'sell', 'dividend', 'yield', 'withdrawal') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    quantity DECIMAL(18, 8),
    unit_price DECIMAL(15, 2),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
    INDEX idx_inv_trans_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: cash_accounts (Contas/Caixas)
-- =====================================================
CREATE TABLE cash_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('checking', 'savings', 'cash', 'credit_card', 'other') NOT NULL,
    institution VARCHAR(200),
    initial_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    credit_limit DECIMAL(15, 2), -- Para cartão de crédito
    closing_day INT, -- Dia de fechamento do cartão
    due_day INT, -- Dia de vencimento
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: alerts (Alertas e notificações)
-- =====================================================
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('budget_warning', 'budget_exceeded', 'bill_due', 'goal_reached', 'investment_change') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reference_id INT, -- ID da entidade relacionada
    reference_type VARCHAR(50), -- 'budget', 'transaction', 'investment'
    is_read BOOLEAN DEFAULT FALSE,
    is_sent_telegram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: settings (Configurações do sistema)
-- =====================================================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Categorias de DESPESAS padrão
INSERT INTO categories (name, type, icon, color) VALUES
('Alimentação', 'expense', 'utensils', '#EF4444'),
('Transporte', 'expense', 'car', '#F97316'),
('Moradia', 'expense', 'home', '#8B5CF6'),
('Saúde', 'expense', 'heart', '#EC4899'),
('Educação', 'expense', 'graduation-cap', '#06B6D4'),
('Lazer', 'expense', 'gamepad', '#10B981'),
('Vestuário', 'expense', 'shirt', '#6366F1'),
('Contas', 'expense', 'file-text', '#F59E0B'),
('Assinaturas', 'expense', 'repeat', '#14B8A6'),
('Outros', 'expense', 'more-horizontal', '#6B7280');

-- Categorias de RECEITAS padrão
INSERT INTO categories (name, type, icon, color) VALUES
('Salário', 'income', 'briefcase', '#22C55E'),
('Freelance', 'income', 'laptop', '#3B82F6'),
('Investimentos', 'income', 'trending-up', '#8B5CF6'),
('Vendas', 'income', 'shopping-bag', '#F97316'),
('Outros', 'income', 'plus-circle', '#6B7280');

-- Categorias de INVESTIMENTOS padrão
INSERT INTO categories (name, type, icon, color) VALUES
('Ações', 'investment', 'bar-chart-2', '#3B82F6'),
('Renda Fixa', 'investment', 'lock', '#22C55E'),
('Fundos', 'investment', 'pie-chart', '#8B5CF6'),
('Criptomoedas', 'investment', 'bitcoin', '#F97316'),
('Imóveis', 'investment', 'building', '#6366F1'),
('Poupança', 'investment', 'piggy-bank', '#10B981');

-- Conta padrão
INSERT INTO cash_accounts (name, type, initial_balance, current_balance) VALUES
('Carteira', 'cash', 0, 0),
('Conta Principal', 'checking', 0, 0);

-- Configurações padrão
INSERT INTO settings (`key`, value, description) VALUES
('telegram_chat_id', '', 'ID do chat do Telegram autorizado'),
('currency', 'BRL', 'Moeda padrão'),
('date_format', 'DD/MM/YYYY', 'Formato de data'),
('alert_budget_threshold', '80', 'Percentual para alerta de orçamento'),
('daily_summary', 'true', 'Enviar resumo diário'),
('weekly_report', 'true', 'Enviar relatório semanal');

SET FOREIGN_KEY_CHECKS = 1;
```

---

## Funcionalidades Detalhadas

### 1. Bot Telegram

#### Comandos Disponíveis
```
/start - Inicia o bot e mostra menu principal
/ajuda - Lista todos os comandos
/saldo - Mostra saldo atual (caixa)
/resumo - Resumo do mês atual
/categorias - Lista categorias disponíveis
/orcamento - Status dos orçamentos
/investimentos - Resumo dos investimentos
/relatorio - Gera relatório do período
```

#### Interpretação de Linguagem Natural
O bot usa a Claude API para interpretar mensagens e extrair:
- Tipo (receita/despesa)
- Valor
- Categoria
- Descrição
- Data (se mencionada)

**Exemplos de mensagens aceitas:**
```
"gastei 150 no mercado"
→ Tipo: expense, Valor: 150, Categoria: Alimentação, Descrição: Mercado

"recebi 5000 de salário"
→ Tipo: income, Valor: 5000, Categoria: Salário, Descrição: Salário

"paguei 89,90 na conta de luz"
→ Tipo: expense, Valor: 89.90, Categoria: Contas, Descrição: Conta de luz

"almocei 45 reais no restaurante ontem"
→ Tipo: expense, Valor: 45, Categoria: Alimentação, Descrição: Almoço restaurante, Data: ontem

"vendi curso por 297"
→ Tipo: income, Valor: 297, Categoria: Vendas, Descrição: Venda de curso

"investi 1000 em ações da petrobras"
→ Registra investimento

"uber 25 reais"
→ Tipo: expense, Valor: 25, Categoria: Transporte, Descrição: Uber
```

#### Fluxo de Confirmação
```
Usuário: "gastei 200 no mercado"

Bot: ✅ Entendi! Confirma o lançamento?

💰 Despesa: R$ 200,00
📁 Categoria: Alimentação
📝 Mercado
📅 02/01/2026

[✓ Confirmar] [✏️ Editar] [❌ Cancelar]
```

#### Alertas Automáticos
```
⚠️ ALERTA DE ORÇAMENTO

Você já gastou 85% do orçamento de Alimentação

📊 Orçamento: R$ 1.500,00
💸 Gasto: R$ 1.275,00
📉 Disponível: R$ 225,00

Faltam 10 dias para o fim do mês.
```

---

### 2. Painel Web - Dashboard

#### Cards de Resumo
- **Saldo Total**: Soma de todas as contas
- **Receitas do Mês**: Total de entradas
- **Despesas do Mês**: Total de saídas
- **Balanço**: Receitas - Despesas
- **Patrimônio Total**: Contas + Investimentos

#### Gráficos
1. **Pizza de Despesas por Categoria** - Onde o dinheiro vai
2. **Pizza de Receitas por Categoria** - De onde o dinheiro vem
3. **Linha de Evolução Mensal** - Receitas x Despesas nos últimos 12 meses
4. **Barras de Orçamento** - Progresso de cada categoria
5. **Área de Fluxo de Caixa** - Entradas e saídas diárias

#### Widgets
- Últimas 10 transações
- Alertas pendentes
- Contas a pagar próximas
- Performance dos investimentos

---

### 3. Gestão de Transações

#### Listagem
- Filtros por período, categoria, tipo, conta
- Busca por descrição
- Ordenação por data, valor
- Paginação
- Exportar para CSV/Excel

#### Formulário de Lançamento Manual
- Tipo (Receita/Despesa)
- Valor
- Categoria (select com ícones)
- Data
- Descrição
- Conta
- Observações
- Marcar como recorrente

---

### 4. Categorias (CRUD)

#### Campos
- Nome
- Tipo (receita/despesa/investimento)
- Ícone (seletor visual)
- Cor
- Ativo/Inativo

---

### 5. Orçamentos

#### Funcionalidades
- Definir valor mensal por categoria
- Copiar orçamento do mês anterior
- Threshold de alerta configurável
- Visualização de progresso
- Histórico de meses anteriores

#### Dashboard de Orçamento
```
┌─────────────────────────────────────────┐
│ Alimentação                    85% ████░│
│ R$ 1.275 / R$ 1.500            ⚠️      │
├─────────────────────────────────────────┤
│ Transporte                     45% ██░░░│
│ R$ 225 / R$ 500                ✓       │
├─────────────────────────────────────────┤
│ Lazer                          120% █████│
│ R$ 360 / R$ 300                🔴      │
└─────────────────────────────────────────┘
```

---

### 6. Investimentos

#### Tipos Suportados
- Ações
- Renda Fixa (CDB, LCI, LCA, Tesouro)
- Fundos
- Criptomoedas
- Imóveis
- Poupança

#### Campos do Investimento
- Nome do ativo
- Tipo
- Instituição/Corretora
- Ticker (código)
- Quantidade
- Preço de compra
- Valor investido
- Data da compra
- Vencimento (se aplicável)
- Rentabilidade esperada

#### Movimentações
- Compra
- Venda
- Dividendos/Proventos
- Rendimentos
- Resgate

#### Dashboard de Investimentos
- Total investido
- Valor atual
- Rentabilidade (R$ e %)
- Distribuição por tipo (pizza)
- Evolução do patrimônio (linha)
- Lista de ativos com performance

---

### 7. Fluxo de Caixa

#### Visão de Caixa
- Saldo inicial do período
- Entradas do período
- Saídas do período
- Saldo final
- Projeção futura (com recorrentes)

#### Gráfico de Fluxo
- Linha do tempo com entradas e saídas
- Saldo acumulado dia a dia
- Previsão baseada em recorrentes

---

### 8. Relatórios

#### Tipos de Relatório
1. **Resumo Mensal**
   - Totais de receitas e despesas
   - Top 5 categorias de gasto
   - Comparativo com mês anterior
   - Gráficos

2. **Por Categoria**
   - Detalhamento de uma categoria específica
   - Todas as transações
   - Média diária/semanal

3. **Anual**
   - Evolução mês a mês
   - Comparativo ano anterior
   - Projeção para restante do ano

4. **Investimentos**
   - Performance por ativo
   - Dividendos recebidos
   - Rentabilidade real vs esperada

#### Exportação
- PDF
- Excel
- CSV

---

## Integração com Claude API

### Prompt para Interpretação de Mensagens

```typescript
const systemPrompt = `Você é um assistente financeiro que interpreta mensagens sobre transações.

Extraia as seguintes informações da mensagem do usuário:
- type: "income" (receita) ou "expense" (despesa)
- amount: valor numérico
- category: categoria mais apropriada da lista fornecida
- description: descrição curta da transação
- date: data no formato YYYY-MM-DD (use a data atual se não especificada)

Categorias de despesa disponíveis: ${expenseCategories.join(', ')}
Categorias de receita disponíveis: ${incomeCategories.join(', ')}

Responda APENAS com um JSON válido, sem markdown.

Exemplo de entrada: "gastei 150 no mercado"
Exemplo de saída: {"type":"expense","amount":150,"category":"Alimentação","description":"Mercado","date":"2026-01-02"}
`;
```

---

## Variáveis de Ambiente (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=finbot
DB_PASSWORD=sua_senha_segura
DB_NAME=finbot

# Telegram
TELEGRAM_BOT_TOKEN=seu_token_do_botfather
TELEGRAM_CHAT_ID=seu_chat_id

# Claude API
ANTHROPIC_API_KEY=sua_api_key

# JWT (para autenticação do painel)
JWT_SECRET=seu_jwt_secret_muito_seguro
JWT_EXPIRES_IN=7d

# Frontend
VITE_API_URL=http://localhost:3000/api
```

---

## Configuração do Telegram Bot

### Criar Bot no BotFather
1. Abra @BotFather no Telegram
2. Envie `/newbot`
3. Escolha um nome: "Meu FinBot"
4. Escolha um username: "meufinbot_bot"
5. Copie o token gerado

### Obter Chat ID
1. Envie qualquer mensagem para o bot
2. Acesse: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Procure pelo `chat.id` na resposta

---

## Deploy no VPS

### Estrutura de Serviços

```bash
# /etc/systemd/system/finbot-backend.service
[Unit]
Description=FinBot Backend API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/finbot/backend
ExecStart=/usr/bin/node dist/app.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Nginx Config

```nginx
# /etc/nginx/sites-available/finbot
server {
    listen 80;
    server_name finbot.seudominio.com;

    # Frontend
    location / {
        root /var/www/finbot/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Próximos Passos para Desenvolvimento

1. **Fase 1 - Backend Base**
   - [ ] Configurar projeto Node.js + TypeScript
   - [ ] Configurar conexão MySQL
   - [ ] Criar models e migrations
   - [ ] Implementar CRUD de categorias
   - [ ] Implementar CRUD de transações

2. **Fase 2 - Bot Telegram**
   - [ ] Configurar bot e handlers
   - [ ] Integrar Claude API
   - [ ] Implementar fluxo de confirmação
   - [ ] Implementar comandos básicos

3. **Fase 3 - Orçamentos e Alertas**
   - [ ] CRUD de orçamentos
   - [ ] Sistema de alertas
   - [ ] Notificações Telegram

4. **Fase 4 - Frontend Base**
   - [ ] Setup React + Vite + Tailwind
   - [ ] Layout e navegação
   - [ ] Dashboard inicial
   - [ ] Listagem de transações

5. **Fase 5 - Investimentos**
   - [ ] CRUD de investimentos
   - [ ] Movimentações
   - [ ] Dashboard de investimentos

6. **Fase 6 - Relatórios e Polimento**
   - [ ] Geração de relatórios
   - [ ] Exportação PDF/Excel
   - [ ] Gráficos avançados
   - [ ] Ajustes de UX

---

## Comandos para Iniciar no Claude Code

```bash
# Criar estrutura do projeto
mkdir -p finbot/{backend,frontend,database}
cd finbot

# Iniciar backend
cd backend
npm init -y
npm install express typescript ts-node @types/node @types/express mysql2 dotenv node-telegram-bot-api @anthropic-ai/sdk cors helmet jsonwebtoken bcryptjs

# Configurar TypeScript
npx tsc --init

# Iniciar frontend  
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install tailwindcss postcss autoprefixer @tanstack/react-query axios recharts lucide-react date-fns
npx tailwindcss init -p
```

---

**Este documento serve como especificação completa para desenvolvimento do FinBot. Use-o como referência no Claude Code para implementar cada funcionalidade.**
