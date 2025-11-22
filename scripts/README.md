# Scripts Utilitários

Esta pasta contém scripts utilitários para o projeto.

## 📋 Scripts Disponíveis

### `generate-password-hash.js`

Gera hash de senha para uso no banco de dados.

**Uso:**
```bash
node scripts/generate-password-hash.js <senha>
```

**Exemplo:**
```bash
node scripts/generate-password-hash.js minhaSenha123
```

## 🔧 Adicionando Novos Scripts

Ao adicionar novos scripts:

1. Coloque-os nesta pasta `scripts/`
2. Documente no README.md
3. Use Node.js para scripts JavaScript
4. Use TypeScript se necessário (com ts-node ou compilação)

