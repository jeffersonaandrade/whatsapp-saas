# Análise do Plano Developer da Groq

## Limites do Plano Developer (Production Systems)

- **200 RPM** (Requests Per Minute) = 200 requisições/minuto
- **200K TPM** (Tokens Per Minute) = 200.000 tokens/minuto

## Cálculo de Uso para o Projeto

### Cenário 1: Atendimento Normal
- **Cliente prospectando**: 1 requisição para análise de intenção + 1 requisição para gerar resposta = **2 requisições por mensagem do cliente**
- **Tokens médios por requisição**: ~500 tokens (prompt + resposta curta)
- **Total por mensagem**: ~1000 tokens

### Cenário 2: Pico de Uso
- **10 clientes simultâneos** enviando mensagens
- Cada um precisa de 2 requisições = **20 requisições**
- **Limite**: 200 RPM = **10x mais capacidade** 🟢

### Capacidade Real

**Por minuto:**
- Máximo de **200 requisições/minuto**
- Considerando 2 requisições por cliente (análise + resposta): **~100 clientes/minuto**
- Com margem de segurança (80%): **~80 clientes/minuto**

**Por hora:**
- **200 RPM × 60 minutos = 12.000 requisições/hora**
- **~6.000 clientes/hora** (considerando 2 requisições por cliente)

**Tokens:**
- **200K tokens/minuto** = **3.333 tokens/segundo**
- Por mensagem: ~1000 tokens = **200 mensagens/minuto** (limite de tokens)
- Mas o limite real é de **200 RPM**, então o gargalo é requests, não tokens

## Conclusão: O Plano Developer é Suficiente?

### ✅ SIM, para MVP e V1
- Suporta **até 80-100 clientes simultâneos** por minuto
- Para um SaaS iniciante, isso é **mais do que suficiente**
- Grátis para sempre (Developer Plan)

### ⚠️ Quando precisará upgrade
- Mais de **80 clientes simultâneos**
- Mais de **6.000 conversas/hora**
- Nesse caso, Groq oferece planos pagos com limites maiores

### Estratégia de Economia Implementada

1. **Não processa IA quando transferido para humano** ✅
   - Economiza 2 requisições por mensagem após transferência

2. **Rate limiting preventivo** ✅
   - Verifica ANTES de fazer requisição
   - Estima tokens antes de chamar API
   - Evita ultrapassar limites

3. **Fallback quando excede** ✅
   - Se exceder limite, usa análise simples (sem IA)
   - Não quebra o atendimento

## Recomendação

O plano Developer é **perfeito para começar** e provavelmente será suficiente até ter centenas de clientes ativos simultaneamente.

