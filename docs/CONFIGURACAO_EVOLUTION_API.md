# Configuração do Evolution API

Este guia explica como configurar e testar a integração com o Evolution API para conectar WhatsApp.

## 📋 Pré-requisitos

1. **Evolution API instalada e rodando**
   - Docker: `docker run -d -p 8080:8080 atendai/evolution-api:latest`
   - Ou instalação manual: [Documentação Evolution API](https://doc.evolution-api.com/)

2. **URL e API Key do Evolution API**
   - URL: geralmente `http://localhost:8080` (local) ou `https://seu-servidor.com` (produção)
   - API Key: gerada na configuração do Evolution API

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local`:

```env
# Evolution API
NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key-aqui
```

**Importante:**
- `NEXT_PUBLIC_EVOLUTION_API_URL`: URL pública do Evolution API (acessível pelo navegador)
- `EVOLUTION_API_KEY`: Chave de API do Evolution API (apenas no servidor)

### 2. Verificar Configuração

O sistema detecta automaticamente se o Evolution API está configurado:
- ✅ **Configurado**: Usa Evolution API real
- ❌ **Não configurado**: Usa mock (para desenvolvimento)

## 🚀 Como Testar

### Opção 1: Teste Local (Docker)

1. **Iniciar Evolution API:**
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-api-key-aqui \
  atendai/evolution-api:latest
```

2. **Configurar variáveis de ambiente:**
```env
NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key-aqui
```

3. **Reiniciar o servidor Next.js:**
```bash
npm run dev
```

4. **Testar no Dashboard:**
   - Acesse: `http://localhost:3000/dashboard`
   - Faça login
   - Clique em "Conectar Agora"
   - Escaneie o QR Code com seu WhatsApp

### Opção 2: Teste com Evolution API em Servidor

1. **Configurar variáveis:**
```env
NEXT_PUBLIC_EVOLUTION_API_URL=https://seu-servidor-evolution.com
EVOLUTION_API_KEY=sua-api-key-aqui
```

2. **Testar conexão:**
```bash
curl -X GET https://seu-servidor-evolution.com/instance/fetchInstances \
  -H "apikey: sua-api-key-aqui"
```

## 📡 Endpoints Utilizados

O sistema usa os seguintes endpoints do Evolution API:

### 1. Criar Instância
```
POST /instance/create
Body: { instanceName: string, qrcode: true }
```

### 2. Conectar e Obter QR Code
```
GET /instance/connect/{instanceName}
```

### 3. Verificar Status
```
GET /instance/connectionState/{instanceName}
```

### 4. Desconectar
```
DELETE /instance/logout/{instanceName}
```

## 🔍 Debugging

### Verificar Logs

1. **Logs do Next.js:**
```bash
# No terminal onde o servidor está rodando
# Procure por mensagens como:
[Evolution API] Criando instância: instance-xxx
[Evolution API] Erro ao criar instância: ...
```

2. **Logs do Evolution API:**
```bash
# Se estiver usando Docker
docker logs evolution-api -f
```

### Erros Comuns

#### 1. "Erro ao criar instância"
- ✅ Verifique se o Evolution API está rodando
- ✅ Verifique se a URL está correta
- ✅ Verifique se a API Key está correta

#### 2. "QR Code não aparece"
- ✅ Verifique os logs do Evolution API
- ✅ Verifique se o endpoint `/instance/connect` está funcionando
- ✅ Teste diretamente: `curl http://localhost:8080/instance/connect/teste`

#### 3. "CORS Error"
- ✅ Configure CORS no Evolution API
- ✅ Ou use um proxy reverso (Nginx, etc.)

## 🧪 Teste Manual via cURL

### 1. Criar Instância
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: sua-api-key" \
  -d '{
    "instanceName": "teste-instance",
    "qrcode": true
  }'
```

### 2. Obter QR Code
```bash
curl -X GET http://localhost:8080/instance/connect/teste-instance \
  -H "apikey: sua-api-key"
```

### 3. Verificar Status
```bash
curl -X GET http://localhost:8080/instance/connectionState/teste-instance \
  -H "apikey: sua-api-key"
```

## 📝 Notas Importantes

1. **Multi-tenancy**: Cada `account_id` tem sua própria instância
   - Nome da instância: `instance-{accountId}`
   - Exemplo: `instance-00000000-0000-0000-0000-000000000001`

2. **Webhook**: Configure o webhook do Evolution API para:
   - URL: `https://seu-dominio.com/api/webhook`
   - Eventos: `messages.upsert`, `connection.update`, `qrcode.update`

3. **Segurança**: 
   - Nunca exponha a `EVOLUTION_API_KEY` no frontend
   - Use HTTPS em produção
   - Configure CORS adequadamente

## 🔄 Fluxo Completo

1. **Usuário clica em "Conectar"**
   - Frontend chama `/api/instance/connect`
   - Backend cria instância no Evolution API
   - Backend obtém QR Code
   - Backend salva instância no Supabase

2. **QR Code é exibido**
   - Usuário escaneia com WhatsApp
   - Evolution API detecta conexão
   - Webhook atualiza status no Supabase

3. **Status é verificado**
   - Frontend verifica status a cada 3 segundos
   - Quando conectado, mostra número do WhatsApp

## 📚 Recursos

- [Documentação Evolution API](https://doc.evolution-api.com/)
- [GitHub Evolution API](https://github.com/EvolutionAPI/evolution-api)
- [Docker Hub](https://hub.docker.com/r/atendai/evolution-api)

