# Teste do Dashboard

## 1. Teste via Navegador

1. Acesse: `http://localhost:3000/dashboard`
2. Faça login com:
   - Email: `admin@test.com`
   - Senha: `teste123`
3. Verifique se aparecem:
   - **Estatísticas:**
     - Conversas Hoje: deve mostrar um número (ex: 5)
     - Mensagens na Fila: deve mostrar um número (ex: 2)
     - Taxa de Resposta: deve mostrar uma porcentagem
     - Tempo Médio: deve mostrar um tempo
   - **Atividade Recente:**
     - Lista de conversas recentes com nomes dos contatos
     - Últimas mensagens
     - Tempo relativo (há X min)

## 2. Teste via API (Postman/curl)

### Teste de Estatísticas
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Cookie: user={\"id\":\"11111111-1111-1111-1111-111111111111\",\"accountId\":\"00000000-0000-0000-0000-000000000001\",\"email\":\"admin@test.com\",\"name\":\"Administrador Teste\",\"role\":\"admin\"}"
```

### Teste de Atividade Recente
```bash
curl -X GET http://localhost:3000/api/dashboard/recent-activity \
  -H "Cookie: user={\"id\":\"11111111-1111-1111-1111-111111111111\",\"accountId\":\"00000000-0000-0000-0000-000000000001\",\"email\":\"admin@test.com\",\"name\":\"Administrador Teste\",\"role\":\"admin\"}"
```

## 3. Verificar Dados no Banco

Execute no Supabase SQL Editor:

```sql
-- Verificar contatos
SELECT * FROM contacts WHERE account_id = '00000000-0000-0000-0000-000000000001';

-- Verificar conversas
SELECT * FROM conversations WHERE account_id = '00000000-0000-0000-0000-000000000001';

-- Verificar mensagens
SELECT COUNT(*) FROM messages 
WHERE conversation_id IN (
  SELECT id FROM conversations 
  WHERE account_id = '00000000-0000-0000-0000-000000000001'
);
```

## 4. Próximos Passos

Após confirmar que o dashboard está funcionando:

1. ✅ **Dashboard com dados reais** - Concluído
2. ⏭️ **Página de Conversas** - Migrar para dados do banco
3. ⏭️ **Página de Produtos** - Migrar para dados do banco
4. ⏭️ **Página de Campanhas** - Migrar para dados do banco
5. ⏭️ **Integração com Evolution API** - Conectar WhatsApp real

