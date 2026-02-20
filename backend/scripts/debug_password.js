const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');

async function debugPassword() {
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
    console.log('📧 Email:', admin.email);
    console.log('🔑 Senha atual no banco (primeiros 50 chars):', admin.senha.substring(0, 50));
    console.log('🔑 Comprimento total da senha:', admin.senha.length);

    // Testar diferentes senhas
    const senhasParaTestar = ['admin123', 'admin', '123456', 'senha'];
    
    for (const senha of senhasParaTestar) {
      console.log(`\n🧪 Testando senha: "${senha}"`);
      
      try {
        const isValid = await bcrypt.compare(senha, admin.senha);
        console.log(`   Resultado: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        
        if (isValid) {
          console.log(`   🎉 SENHA CORRETA ENCONTRADA: "${senha}"`);
          break;
        }
      } catch (error) {
        console.log(`   ❌ Erro ao testar: ${error.message}`);
      }
    }

    // Gerar um novo hash para admin123
    console.log('\n🔐 Gerando novo hash para "admin123"...');
    const novoHash = await bcrypt.hash('admin123', 12);
    console.log('🔑 Novo hash:', novoHash);
    
    // Testar o novo hash
    const testeNovoHash = await bcrypt.compare('admin123', novoHash);
    console.log('🧪 Teste do novo hash:', testeNovoHash ? '✅ Sucesso' : '❌ Falha');

    // Atualizar se o teste do novo hash funcionar
    if (testeNovoHash) {
      console.log('\n💾 Atualizando senha no banco...');
      await admin.update({ senha: novoHash });
      console.log('✅ Senha atualizada!');
      
      // Testar novamente após atualização
      const adminAtualizado = await User.findOne({ where: { email: 'admin@ongnovoamanha.org' } });
      const testeFinal = await bcrypt.compare('admin123', adminAtualizado.senha);
      console.log('🧪 Teste final após atualização:', testeFinal ? '✅ Sucesso' : '❌ Falha');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

debugPassword();
