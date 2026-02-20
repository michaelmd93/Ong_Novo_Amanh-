const bcrypt = require('bcryptjs');

async function directTest() {
  try {
    console.log('🧪 Teste direto do bcrypt...');
    
    // Testar se bcrypt está funcionando
    const testSenha = 'admin123';
    const hash = await bcrypt.hash(testSenha, 12);
    console.log('🔑 Hash gerado:', hash);
    
    const compare1 = await bcrypt.compare(testSenha, hash);
    console.log('🧪 Teste 1 (senha correta):', compare1 ? '✅ Sucesso' : '❌ Falha');
    
    const compare2 = await bcrypt.compare('senha_errada', hash);
    console.log('🧪 Teste 2 (senha errada):', compare2 ? '❌ Erro' : '✅ Sucesso');
    
    // Agora testar com o modelo User
    console.log('\n🔧 Testando com modelo User...');
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    
    const { User } = require('../models');
    const admin = await User.findOne({ where: { email: 'admin@ongnovoamanha.org' } });
    
    if (admin) {
      console.log('👤 Admin encontrado');
      console.log('🔑 Senha no banco:', admin.senha.substring(0, 50) + '...');
      
      // Testar método verificarSenha do modelo
      const testeModelo1 = await admin.verificarSenha('admin123');
      console.log('🧪 Teste modelo (admin123):', testeModelo1 ? '✅ Sucesso' : '❌ Falha');
      
      // Testar bcrypt.compare direto
      const testeDireto = await bcrypt.compare('admin123', admin.senha);
      console.log('🧪 Teste direto bcrypt (admin123):', testeDireto ? '✅ Sucesso' : '❌ Falha');
      
      // Se falhar, vamos criar um novo hash e atualizar
      if (!testeDireto) {
        console.log('\n🔧 Criando novo hash...');
        const novoHash = await bcrypt.hash('admin123', 12);
        console.log('🔑 Novo hash:', novoHash);
        
        // Testar o novo hash
        const testeNovoHash = await bcrypt.compare('admin123', novoHash);
        console.log('🧪 Teste novo hash:', testeNovoHash ? '✅ Sucesso' : '❌ Falha');
        
        if (testeNovoHash) {
          console.log('💾 Atualizando no banco...');
          await admin.update({ senha: novoHash });
          
          // Buscar novamente e testar
          const adminAtualizado = await User.findOne({ where: { email: 'admin@ongnovoamanha.org' } });
          const testeFinal = await bcrypt.compare('admin123', adminAtualizado.senha);
          console.log('🧪 Teste final:', testeFinal ? '✅ Sucesso' : '❌ Falha');
        }
      }
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

directTest();
