const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');

async function fixPasswordRaw() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    // Gerar hash correto
    const senha = 'admin123';
    const hash = await bcrypt.hash(senha, 12);
    console.log('🔑 Hash gerado:', hash);
    console.log('🔑 Comprimento do hash:', hash.length);

    // Atualizar diretamente no SQL sem passar pelo Sequelize
    const query = `UPDATE usuarios SET senha = :hash, updated_at = NOW() WHERE email = :email`;
    const result = await sequelize.query(query, {
      replacements: { hash, email: 'admin@ongnovoamanha.org' },
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('💾 Senha atualizada diretamente no banco!');
    console.log('📊 Linhas afetadas:', result[1]);

    // Verificar se foi salvo corretamente
    const [user] = await sequelize.query(
      'SELECT email, senha, LENGTH(senha) as length FROM usuarios WHERE email = :email',
      {
        replacements: { email: 'admin@ongnovoamanha.org' },
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('📧 Email:', user.email);
    console.log('🔑 Senha salva:', user.senha);
    console.log('📏 Comprimento:', user.length);

    // Testar a senha
    const isValid = await bcrypt.compare(senha, user.senha);
    console.log('🧪 Teste de senha:', isValid ? '✅ Sucesso' : '❌ Falha');

    if (isValid) {
      console.log('\n🎉 SENHA DO ADMIN CORRIGIDA!');
      console.log('📧 Email: admin@ongnovoamanha.org');
      console.log('🔑 Senha: admin123');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

fixPasswordRaw();
