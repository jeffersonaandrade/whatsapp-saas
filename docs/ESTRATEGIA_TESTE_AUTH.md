# 🤔 Estratégia de Teste - Autenticação

Análise das opções para testar a conexão com o banco de dados, começando pelo login.

## 📊 Situação Atual

- ✅ Banco de dados criado no Supabase
- ✅ Tabelas criadas (accounts, users, etc.)
- ✅ Scripts de migração executados
- ✅ Cliente Supabase configurado (`lib/supabase.ts`)
- ⚠️ Autenticação ainda está mockada (`contexts/AuthContext.tsx`)

## 🎯 Opções de Abordagem

### Opção 1: **Mocks no Supabase (Dados de Teste)**

**Como funciona:**
- Criar registros de teste diretamente no Supabase (via SQL ou Dashboard)
- Implementar login que busca esses dados no Supabase
- Não usa Supabase Auth, apenas consulta a tabela `users`

**Prós:**
- ✅ Testa a conexão com o banco imediatamente
- ✅ Valida queries e estrutura de dados
- ✅ Testa RLS (Row Level Security)
- ✅ Rápido para começar
- ✅ Não precisa configurar email/password no Supabase Auth

**Contras:**
- ❌ Não testa Supabase Auth (autenticação real)
- ❌ Senhas não são criptografadas (armazenadas em texto)
- ❌ Não é a solução final (será necessário migrar depois)
- ❌ Não testa fluxo completo de cadastro

**Quando usar:**
- Para validar estrutura do banco
- Para testar queries e RLS
- Como passo intermediário antes de implementar Auth real

---

### Opção 2: **Supabase Auth Real**

**Como funciona:**
- Usar Supabase Auth para gerenciar usuários
- Tabela `auth.users` gerida pelo Supabase
- Tabela `users` complementar com dados adicionais
- Login/cadastro via `supabase.auth.signInWithPassword()` e `supabase.auth.signUp()`

**Prós:**
- ✅ Solução final e completa
- ✅ Senhas criptografadas automaticamente
- ✅ Recuperação de senha, verificação de email, etc.
- ✅ Integração completa com RLS
- ✅ JWT tokens automáticos
- ✅ Não precisa migrar depois

**Contras:**
- ❌ Mais complexo de implementar
- ❌ Precisa configurar email no Supabase (ou usar magic links)
- ❌ Para testes, precisa criar usuários reais ou configurar SMTP
- ❌ Mais difícil de debugar inicialmente

**Quando usar:**
- Quando quiser a solução final
- Quando precisar de segurança real
- Quando estiver pronto para produção

---

### Opção 3: **Abordagem Híbrida (Recomendada)**

**Como funciona:**
1. **Fase 1**: Criar dados mock no Supabase e implementar login que consulta a tabela `users`
   - Testa conexão, queries, RLS
   - Valida estrutura do banco
   
2. **Fase 2**: Migrar para Supabase Auth real
   - Substituir consulta direta por `supabase.auth`
   - Manter mesma estrutura de dados

**Prós:**
- ✅ Melhor dos dois mundos
- ✅ Valida estrutura antes de implementar Auth
- ✅ Migração gradual e segura
- ✅ Aprendizado incremental

**Contras:**
- ⚠️ Precisa fazer migração depois (mas é simples)

**Quando usar:**
- **RECOMENDADO** para este projeto
- Quando quer validar estrutura antes de Auth
- Quando quer aprender gradualmente

---

## 💡 Recomendação

### **Opção 3: Abordagem Híbrida**

**Justificativa:**
1. Você já tem o banco criado - vamos validar que está funcionando
2. Testar queries e RLS antes de adicionar complexidade do Auth
3. Migração para Auth real será simples depois
4. Permite validar a estrutura completa do banco

### Plano de Implementação:

#### **Fase 1: Mocks no Supabase (Agora)**
1. Criar script SQL para inserir dados de teste:
   - 1 conta (`accounts`)
   - 2 usuários (`users`) - admin e agente
   - 1 instância (`instances`)
   
2. Implementar login que:
   - Busca usuário na tabela `users` pelo email
   - Compara senha (em texto por enquanto)
   - Retorna dados do usuário

3. Testar:
   - ✅ Conexão com Supabase
   - ✅ Queries funcionando
   - ✅ RLS funcionando
   - ✅ Estrutura de dados correta

#### **Fase 2: Supabase Auth (Depois)**
1. Substituir login mock por `supabase.auth.signInWithPassword()`
2. Ajustar cadastro para usar `supabase.auth.signUp()`
3. Criar trigger no Supabase para criar registro em `users` automaticamente

---

## 🚀 Próximos Passos (Se escolher Opção 3)

1. **Criar script SQL com dados de teste**
   ```sql
   -- Inserir conta de teste
   INSERT INTO accounts (id, owner_email, company_name) 
   VALUES ('...', 'admin@test.com', 'Empresa Teste');
   
   -- Inserir usuários de teste
   INSERT INTO users (id, account_id, name, email, role, password_hash)
   VALUES (...);
   ```

2. **Implementar login que consulta Supabase**
   - Substituir mock por query real
   - Manter mesma interface

3. **Testar e validar**
   - Login funciona
   - Dados corretos
   - RLS funcionando

---

## ❓ Decisão

**Qual abordagem você prefere?**

- [ ] Opção 1: Mocks no Supabase (rápido, mas temporário)
- [ ] Opção 2: Supabase Auth real (completo, mas mais complexo)
- [ ] Opção 3: Híbrida (recomendada - gradual)

**Minha recomendação: Opção 3** 🎯

---

**Última atualização**: Agora

