const { sequelize } = require('../models');

async function debugAlunos() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    const { Aluno, User } = require('../models');
    
    console.log('\n🧪 Testando busca de alunos...');
    
    try {
      // Teste 1: Buscar sem include
      console.log('\n1️⃣ Testando busca simples...');
      const alunosSimples = await Aluno.findAll({
        limit: 5,
        order: [['nome', 'ASC']]
      });
      
      console.log(`📊 Encontrados ${alunosSimples.length} alunos (simples)`);
      
      if (alunosSimples.length > 0) {
        const aluno = alunosSimples[0];
        console.log('👤 Primeiro aluno:', aluno.nome);
        console.log('📅 Data nasc:', aluno.data_nasc);
        console.log('🔧 Método getIdade disponível:', typeof aluno.getIdade);
        
        if (typeof aluno.getIdade === 'function') {
          try {
            const idade = aluno.getIdade();
            console.log('👶 Idade calculada:', idade);
          } catch (error) {
            console.log('❌ Erro ao calcular idade:', error.message);
          }
        }
      }
      
      // Teste 2: Buscar com include
      console.log('\n2️⃣ Testando busca com include...');
      const alunosComInclude = await Aluno.findAll({
        limit: 5,
        order: [['nome', 'ASC']],
        include: [{
          model: User,
          as: 'usuario_cadastro',
          attributes: ['id', 'nome', 'email'],
          required: false
        }]
      });
      
      console.log(`📊 Encontrados ${alunosComInclude.length} alunos (com include)`);
      
      if (alunosComInclude.length > 0) {
        const aluno = alunosComInclude[0];
        console.log('👤 Aluno com include:', aluno.nome);
        console.log('👤 Usuário cadastro:', aluno.usuario_cadastro ? aluno.usuario_cadastro.nome : 'Nulo');
        
        // Testar toJSON
        try {
          const alunoJson = aluno.toJSON();
          console.log('✅ toJSON funcionou');
          console.log('👶 Idade no JSON:', alunoJson.idade);
        } catch (error) {
          console.log('❌ Erro no toJSON:', error.message);
        }
      }
      
      // Teste 3: Simular o getAlunos do controller
      console.log('\n3️⃣ Testando exatamente como o controller...');
      const { count, rows } = await Aluno.findAndCountAll({
        limit: 10,
        offset: 0,
        order: [['nome', 'ASC']],
        include: [{
          model: User,
          as: 'usuario_cadastro',
          attributes: ['id', 'nome', 'email'],
          required: false
        }]
      });
      
      console.log(`📊 Total: ${count}, Rows: ${rows.length}`);
      
      // Testar o map com getIdade
      try {
        const alunosComIdade = rows.map(aluno => ({
          ...aluno.toJSON(),
          idade: aluno.getIdade()
        }));
        console.log('✅ Map com getIdade funcionou!');
        console.log('👤 Primeiro aluno com idade:', alunosComIdade[0]?.nome, alunosComIdade[0]?.idade);
      } catch (error) {
        console.log('❌ Erro no map com getIdade:', error.message);
        console.log('🔍 Stack:', error.stack);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      console.log('🔍 Stack completo:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await sequelize.close();
  }
}

debugAlunos();
