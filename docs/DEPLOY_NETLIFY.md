# 🚀 Guia de Deploy no Netlify

Este guia explica como fazer deploy do projeto WhatsApp SaaS no Netlify.

## 📋 Pré-requisitos

1. **Conta no Netlify** (gratuita): [netlify.com](https://www.netlify.com)
2. **Repositório Git** (GitHub, GitLab ou Bitbucket)
3. **Variáveis de ambiente configuradas**

## 🔧 Passo 1: Preparar o Repositório

1. **Faça commit e push do código:**
   ```bash
   git add .
   git commit -m "Preparar para deploy no Netlify"
   git push origin main
   ```

2. **Verifique se o arquivo `netlify.toml` está no repositório**

## 🔑 Passo 2: Configurar Variáveis de Ambiente no Netlify

### 2.1. Acessar Configurações

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Selecione seu site (ou crie um novo)
3. Vá em **Site settings** → **Environment variables**

### 2.2. Adicionar Variáveis Obrigatórias

Adicione as seguintes variáveis de ambiente:

#### Supabase (Obrigatório)
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

#### Evolution API (Obrigatório se usar WhatsApp)
```
NEXT_PUBLIC_EVOLUTION_API_URL=https://seu-servidor-evolution.com
EVOLUTION_API_KEY=sua-chave-evolution-api
```

#### Motor API (Opcional - apenas se o Motor estiver em servidor separado)
```
NEXT_PUBLIC_MOTOR_API_URL=https://seu-motor-api.com
```

#### Groq AI (Opcional - pode ser configurado por conta)
```
GROQ_API_KEY=sua-chave-groq-aqui
```

### 2.3. Variáveis por Ambiente

O Netlify permite configurar variáveis diferentes para:
- **Production** (produção)
- **Deploy previews** (previews de PR)
- **Branch deploys** (outras branches)

Configure as variáveis de produção primeiro.

## 🚀 Passo 3: Fazer Deploy

### Opção 1: Deploy Automático via Git (Recomendado)

1. **Conectar Repositório:**
   - No Netlify, clique em **Add new site** → **Import an existing project**
   - Conecte seu repositório (GitHub, GitLab ou Bitbucket)
   - Selecione a branch `main` (ou `master`)

2. **Configurar Build:**
   - **Build command:** `npm run build` (já configurado no `netlify.toml`)
   - **Publish directory:** `.next` (já configurado no `netlify.toml`)
   - **Node version:** `20` (já configurado no `netlify.toml`)

3. **Deploy:**
   - Clique em **Deploy site**
   - O Netlify fará o build automaticamente
   - Aguarde o deploy concluir (geralmente 2-5 minutos)

### Opção 2: Deploy Manual via Netlify CLI

1. **Instalar Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Fazer login:**
   ```bash
   netlify login
   ```

3. **Inicializar site:**
   ```bash
   netlify init
   ```
   - Escolha: **Create & configure a new site**
   - Escolha: **Team** (se aplicável)
   - Escolha: **Site name** (ou deixe gerar automaticamente)

4. **Fazer deploy:**
   ```bash
   netlify deploy --prod
   ```

## ✅ Passo 4: Verificar Deploy

1. **Acesse a URL do site:**
   - O Netlify fornece uma URL como: `https://seu-site.netlify.app`
   - Você pode personalizar o domínio em **Site settings** → **Domain management**

2. **Teste as funcionalidades:**
   - Acesse a página de login
   - Teste autenticação
   - Teste conexão WhatsApp (se Evolution API estiver configurada)

## 🔍 Troubleshooting

### Erro: "Build failed"

**Possíveis causas:**
- Variáveis de ambiente não configuradas
- Erro de sintaxe no código
- Dependências não instaladas

**Solução:**
1. Verifique os logs de build no Netlify
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Teste o build localmente: `npm run build`

### Erro: "Environment variable not found"

**Solução:**
1. Verifique se todas as variáveis estão configuradas no Netlify
2. Variáveis com `NEXT_PUBLIC_` são expostas ao cliente
3. Variáveis sem `NEXT_PUBLIC_` são apenas no servidor

### Erro: "CORS" ou "Cookie not sent"

**Possível causa:**
- Cookies não funcionam entre domínios diferentes

**Solução:**
1. Configure o mesmo domínio para frontend e backend
2. Ou configure CORS no backend
3. Ou use proxy no Netlify (via `netlify.toml`)

### Erro: "Evolution API connection failed"

**Solução:**
1. Verifique se `NEXT_PUBLIC_EVOLUTION_API_URL` está correto
2. Verifique se `EVOLUTION_API_KEY` está correto
3. Verifique se o Evolution API está acessível publicamente
4. Se o Evolution API estiver em servidor privado, configure um proxy

## 📝 Notas Importantes

### 1. Variáveis de Ambiente

- **`NEXT_PUBLIC_*`**: Expostas ao cliente (navegador)
- **Sem `NEXT_PUBLIC_`**: Apenas no servidor (mais seguro)

### 2. Cookies e Domínios

- Cookies funcionam apenas no mesmo domínio
- Se o frontend estiver em `app.netlify.app` e o backend em outro servidor, cookies podem não funcionar
- **Solução:** Use o mesmo domínio ou configure proxy

### 3. Evolution API

- O Evolution API precisa estar acessível publicamente
- Ou configure um proxy reverso (Nginx, etc.)
- Ou use um serviço de proxy (Cloudflare, etc.)

### 4. Build Time

- O build no Netlify pode levar 2-5 minutos
- Primeiro deploy geralmente é mais lento
- Deploys subsequentes são mais rápidos (cache)

## 🔄 Atualizações Futuras

Após o primeiro deploy, todas as atualizações no repositório Git serão deployadas automaticamente:

1. Faça commit e push das mudanças
2. O Netlify detecta automaticamente
3. Faz build e deploy automaticamente
4. Você recebe notificação por email (se configurado)

## 📚 Recursos Adicionais

- [Documentação Netlify](https://docs.netlify.com/)
- [Next.js no Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Variáveis de Ambiente no Netlify](https://docs.netlify.com/environment-variables/overview/)

