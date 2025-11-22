const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'teste123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Senha:', password);
  console.log('Hash:', hash);
}

generateHash();

