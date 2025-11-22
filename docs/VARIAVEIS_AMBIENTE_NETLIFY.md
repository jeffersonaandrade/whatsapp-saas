# 🔐 Variáveis de Ambiente no Netlify (CÉREBRO)

## ⚠️ IMPORTANTE: Verificação de Segurança

### Variável Correta para o Motor

O código em `lib/motor-client.ts` está buscando:
```typescript
const MOTOR_API_URL = process.env.NEXT_PUBLIC_MOTOR_API_URL || 'https://whatsapp-evolution-api-fa3y.onrender.com';
```

**Nome da variável:** `NEXT_PUBLIC_MOTOR_API_URL`

---

## ✅ Configuração no Netlify

### Variáveis OBRIGATÓRIAS

Adicione estas variáveis no Netlify (Site settings → Environment variables):

| Key | Value | Descrição |
|-----|-------|-----------|
| `NEXT_PUBLIC_MOTOR_API_URL` | `https://whatsapp-evolution-api-fa3y.onrender.com` | URL do Motor (Serviço Externo) |

### Variáveis OPCIONAIS (se necessário)

| Key | Value | Descrição |
|-----|-------|-----------|
| `NEXT_PUBLIC_EVOLUTION_API_URL` | (remover ou deixar vazio) | **NÃO USAR MAIS** - Esta variável não é mais usada no CÉREBRO |

---

## 🔍 Verificação

### 1. Verificar no Código

O arquivo `lib/motor-client.ts` deve ter:
```typescript
const MOTOR_API_URL = process.env.NEXT_PUBLIC_MOTOR_API_URL || 'https://whatsapp-evolution-api-fa3y.onrender.com';
```

### 2. Verificar no Netlify

1. Acesse: Netlify Dashboard → Seu Site → Site settings → Environment variables
2. Procure por: `NEXT_PUBLIC_MOTOR_API_URL`
3. Valor deve ser: `https://whatsapp-evolution-api-fa3y.onrender.com`

### 3. Após Configurar

1. **Salve** as variáveis no Netlify
2. **Trigger Deploy** (ou aguarde o próximo deploy automático)
3. Verifique os logs do deploy para confirmar que a variável está sendo lida

---

## 🐛 Troubleshooting

### Erro: "Network Error" ou "Cannot connect"

**Causa:** Variável `NEXT_PUBLIC_MOTOR_API_URL` não configurada ou com valor incorreto.

**Solução:**
1. Verifique se a variável existe no Netlify
2. Verifique se o valor está correto: `https://whatsapp-evolution-api-fa3y.onrender.com`
3. Faça um novo deploy após configurar

### Erro: "localhost:3001" ou "localhost:8080"

**Causa:** Código tentando chamar URLs locais que não existem no Netlify.

**Solução:**
1. Verifique se `motor-service.ts` está usando rotas relativas (sem baseURL)
2. Verifique se `motor-client.ts` está usando `NEXT_PUBLIC_MOTOR_API_URL`

---

## 📝 Checklist de Deploy

Antes de fazer deploy no Netlify:

- [ ] Variável `NEXT_PUBLIC_MOTOR_API_URL` configurada no Netlify
- [ ] Valor da variável: `https://whatsapp-evolution-api-fa3y.onrender.com`
- [ ] Variável `NEXT_PUBLIC_EVOLUTION_API_URL` removida ou vazia (não usada mais)
- [ ] Build local passou (`npm run build`)
- [ ] Código commitado e pushado

---

## 🔄 Fluxo Correto

```
Frontend (Browser)
  ↓ POST /api/instance/connect (rota relativa)
API Route do CÉREBRO (Netlify)
  ↓ Usa motor-client.ts
  ↓ Lê NEXT_PUBLIC_MOTOR_API_URL
  ↓ POST https://whatsapp-evolution-api-fa3y.onrender.com/api/instance/connect
Motor (Render)
  ↓ Processa e chama Evolution API
Evolution API (Docker)
```

---

## 📚 Referências

- Arquitetura: `docs/ARQUITETURA_CEREBRO.md`
- Refatoração: `docs/REFATORACAO_PROXY_MOTOR.md`

