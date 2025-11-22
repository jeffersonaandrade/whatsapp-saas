# Banner de Cookies - Conformidade LGPD

## 📋 Implementação

Banner de cookies implementado conforme a **Lei Geral de Proteção de Dados (LGPD)** que informa ao usuário sobre o uso de cookies após o login.

## 🎯 Funcionalidades

### 1. **Exibição Automática**
- Aparece automaticamente após o login
- Só é exibido uma vez (até o usuário limpar localStorage)
- Não aparece se o usuário não estiver logado

### 2. **Informações Exibidas**
- ✅ Aviso sobre uso de cookies
- ✅ Link para Política de Privacidade
- ✅ Informação sobre tipos de cookies utilizados
- ✅ Botões para Aceitar/Recusar

### 3. **Ações do Usuário**
- **Aceitar**: Salva consentimento e fecha o banner
- **Recusar**: Salva recusa e fecha o banner
- **Fechar (X)**: Fecha sem salvar preferência (aparecerá novamente)

## 🔒 Conformidade LGPD

### Requisitos Atendidos:

1. ✅ **Informação Transparente**
   - Usuário é informado sobre o uso de cookies
   - Explicação clara do propósito

2. ✅ **Consentimento Explícito**
   - Usuário pode aceitar ou recusar
   - Ação consciente e voluntária

3. ✅ **Acesso à Política**
   - Link direto para Política de Privacidade
   - Informações detalhadas disponíveis

4. ✅ **Registro de Consentimento**
   - Preferência salva no localStorage
   - Timestamp do consentimento registrado

## 📝 Estrutura de Dados

### Cookie Consent (localStorage)

```typescript
interface CookieConsent {
  accepted: boolean;    // true = aceito, false = recusado
  timestamp: number;    // Timestamp do consentimento
}
```

**Chave**: `cookie-consent-lgpd`

## 🎨 Design

- **Posição**: Fixo na parte inferior da tela
- **Estilo**: Banner branco com borda superior
- **Animações**: Transição suave ao aparecer/desaparecer
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 🔧 Como Funciona

### Fluxo:

1. **Usuário faz login**
   - Sistema verifica se há consentimento salvo
   - Se não houver, exibe o banner

2. **Usuário interage**
   - Clica em "Aceitar" ou "Recusar"
   - Preferência é salva no localStorage
   - Banner desaparece

3. **Próximas visitas**
   - Sistema verifica localStorage
   - Se houver consentimento, não exibe o banner

## 📱 Responsividade

- **Desktop**: Banner completo com todos os elementos
- **Mobile**: Layout adaptado, botões empilhados se necessário

## 🔄 Resetar Consentimento

Para testar novamente ou resetar o consentimento:

```javascript
// No console do navegador
localStorage.removeItem('cookie-consent-lgpd');
// Recarregue a página
```

## 📚 Cookies Utilizados

### Cookies Essenciais (Sempre Ativos)
- **`user`**: Cookie httpOnly para autenticação
  - Duração: 12 horas
  - Propósito: Manter sessão do usuário
  - Tipo: httpOnly, secure (produção)

### Cookies de Preferências
- **`cookie-consent-lgpd`**: Preferência do usuário
  - Duração: Permanente (até limpar localStorage)
  - Propósito: Lembrar consentimento do usuário
  - Tipo: localStorage

## ⚠️ Importante

1. **Cookies Essenciais**: Não podem ser desabilitados (necessários para autenticação)
2. **Consentimento**: O banner informa, mas cookies essenciais continuam funcionando
3. **LGPD**: O banner atende aos requisitos de transparência e informação

## 🧪 Teste

1. Faça login
2. O banner deve aparecer na parte inferior
3. Clique em "Aceitar" ou "Recusar"
4. Recarregue a página - o banner não deve aparecer novamente
5. Limpe o localStorage e recarregue - o banner aparece novamente

## 📖 Referências

- [LGPD - Lei Geral de Proteção de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Guia de Cookies - ANPD](https://www.gov.br/anpd/pt-br)

