const { sequelize } = require('../models');

async function debugDoacoes() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    const { Doacao, User } = require('../models');
    
    console.log('\n🧪 Testando busca de doações...');
    
    try {
      // Teste 1: Buscar sem include
      console.log('\n1️⃣ Testando busca simples...');
      const doacoesSimples = await Doacao.findAll({
        limit: 5,
        order: [['data_doacao', 'DESC']]
      });
      
      console.log(`📊 Encontradas ${doacoesSimples.length} doações (simples)`);
      
      if (doacoesSimples.length > 0) {
        const doacao = doacoesSimples[0];
        console.log('👤 Primeira doação:', doacao.nome_doador);
        console.log('📅 Data:', doacao.data_doacao);
        console.log('💰 Valor:', doacao.valor);
        console.log('📦 Tipo:', doacao.tipo);
        console.log('📊 Status:', doacao.status);
      }
      
      // Teste 2: Buscar com include
      console.log('\n2️⃣ Testando busca com include...');
      const doacoesComInclude = await Doacao.findAll({
        limit: 5,
        order: [['data_doacao', 'DESC']],
        include: [{
          model: User,
          as: 'usuario_registro',
          attributes: ['id', 'nome', 'email'],
          required: false
        }]
      });
      
      console.log(`📊 Encontradas ${doacoesComInclude.length} doações (com include)`);
      
      if (doacoesComInclude.length > 0) {
        const doacao = doacoesComInclude[0];
        console.log('👤 Doação com include:', doacao.nome_doador);
        console.log('👤 Usuário cadastro:', doacao.usuario_registro ? doacao.usuario_registro.nome : 'Nulo');
      }
      
      // Teste 3: Simular o getDoacoes do controller
      console.log('\n3️⃣ Testando exatamente como o controller...');
      const { count, rows } = await Doacao.findAndCountAll({
        limit: 10,
        offset: 0,
        order: [['data_doacao', 'DESC']],
        include: [{
          model: User,
          as: 'usuario_registro',
          attributes: ['id', 'nome', 'email'],
          required: false
        }]
      });
      
      console.log(`📊 Total: ${count}, Rows: ${rows.length}`);
      
      // Teste 4: Criar uma doação de teste
      console.log('\n4️⃣ Testando criação de doação...');
      const novaDoacao = await Doacao.create({
        nome_doador: 'Doador Teste',
        email: 'teste@exemplo.com',
        telefone_doador: '(11) 99999-9999',
        documento_doador: '123.456.789-00',
        tipo: 'alimentos',
        valor: 100.00,
        descricao_itens: 'Arroz, feijão, óleo',
        observacoes: 'Doação de teste',
        status: 'pendente',
        usuario_id: 1
      });
      
      console.log('✅ Doação criada com sucesso!');
      console.log('🆔 ID:', novaDoacao.id);
      console.log('👤 Nome:', novaDoacao.nome_doador);
      console.log('📦 Tipo:', novaDoacao.tipo);
      
      // Teste 5: Buscar a doação criada
      const doacaoBuscada = await Doacao.findByPk(novaDoacao.id);
      console.log('✅ Doação encontrada:', doacaoBuscada ? 'Sim' : 'Não');
      
      // Limpeza: remover doação de teste
      await novaDoacao.destroy();
      console.log('🗑️ Doação de teste removida');
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      console.log('🔍 Stack:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await sequelize.close();
  }
}

debugDoacoes();
