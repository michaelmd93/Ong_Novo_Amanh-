const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');

async function fixAdminPassword() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    const { User } = require('../models');
    
    // Buscar usuário admin
    const admin = await User.findOne({ where: { email: 'admin@ongnovoamanha.org' } });
    
    if (!admin) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }

    console.log('👤 Usuário admin encontrado:', admin.nome);

    // Gerar nova senha correta
    const novaSenha = 'admin123';
    const rounds = 12;
    const hashSenha = await bcrypt.hash(novaSenha, rounds);
    
    console.log('🔐 Nova senha gerada:', novaSenha);
    console.log('🔑 Hash gerado:', hashSenha);

    // Atualizar senha no banco
    await admin.update({ senha: hashSenha });
    
    console.log('✅ Senha do admin atualizada com sucesso!');
    console.log('📧 Email: admin@ongnovoamanha.org');
    console.log('🔑 Senha: admin123');
    
    // Testar verificação
    const senhaValida = await admin.verificarSenha(novaSenha);
    console.log('🧪 Teste de verificação:', senhaValida ? '✅ Sucesso' : '❌ Falha');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

fixAdminPassword();
