# 📦 Tipos TypeScript

Esta pasta contém todas as definições de tipos TypeScript do projeto, organizadas por domínio.

## 📋 Estrutura

- **`index.ts`** - Exporta todos os tipos (barrel export)
- **`whatsapp.ts`** - Tipos relacionados ao WhatsApp (instâncias, mensagens, etc.)
- **`conversation.ts`** - Tipos relacionados a conversas e contatos
- **`campaign.ts`** - Tipos relacionados a campanhas e grupos
- **`user.ts`** - Tipos relacionados a usuários e permissões
- **`api.ts`** - Tipos relacionados a APIs externas (Evolution API, etc.)
- **`stats.ts`** - Tipos relacionados a estatísticas e métricas

## 🔄 Como Usar

Importe os tipos do barrel export:

```typescript
import { WhatsAppInstance, Conversation, User } from '@/types';
```

Ou importe diretamente de um arquivo específico:

```typescript
import { WhatsAppInstance } from '@/types/whatsapp';
```

## 📝 Convenções

- Use `PascalCase` para interfaces e tipos
- Use `camelCase` para propriedades
- Documente tipos complexos com comentários JSDoc
- Mantenha tipos relacionados no mesmo arquivo

