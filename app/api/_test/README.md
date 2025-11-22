# 🧪 Rotas de Teste

Esta pasta contém rotas de teste e desenvolvimento que **NÃO devem ser expostas em produção**.

## ⚠️ Importante

- Estas rotas são apenas para desenvolvimento e testes
- **Nunca exponha estas rotas em produção**
- Considere remover ou proteger com autenticação antes do deploy

## 📋 Rotas Disponíveis

### `GET /api/_test/test-supabase`
Testa a conexão com o Supabase.

**Uso:**
```bash
curl http://localhost:3000/api/_test/test-supabase
```

### `GET /api/_test/test-groq`
Testa a conexão com a API Groq (se configurado).

## 🔒 Proteção em Produção

Para proteger estas rotas em produção, você pode:

1. **Remover completamente** antes do deploy
2. **Adicionar verificação de ambiente:**
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     return NextResponse.json({ error: 'Not found' }, { status: 404 });
   }
   ```
3. **Adicionar autenticação** com token secreto

