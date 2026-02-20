const { sequelize } = require('../models');

async function seedDoacoes() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    const { Doacao } = require('../models');
    
    // Limpar doações existentes
    await Doacao.destroy({ where: {}, force: true });
    console.log('🗑️ Doações existentes removidas');

    // Doações de exemplo
    const doacoesExemplo = [
      {
        nome_doador: 'Maria Santos',
        email: 'maria.santos@email.com',
        telefone_doador: '(11) 98765-4321',
        documento_doador: '987.654.321-00',
        tipo: 'alimentos',
        valor: 200.00,
        descricao_itens: 'Arroz 5kg, Feijão 2kg, Óleo 900ml',
        observacoes: 'Doação para cestas básicas',
        status: 'recebida',
        usuario_id: 1,
        data_doacao: new Date('2026-02-15'),
        data_recebimento: new Date('2026-02-16')
      },
      {
        nome_doador: 'João Oliveira',
        email: 'joao.oliveira@email.com',
        telefone_doador: '(11) 91234-5678',
        documento_doador: '456.789.123-00',
        tipo: 'materiais_higiene',
        valor: 150.00,
        descricao_itens: 'Sabonete, Pasta de dente, Shampoo',
        observacoes: 'Kit higiene pessoal',
        status: 'pendente',
        usuario_id: 1,
        data_doacao: new Date('2026-02-18')
      },
      {
        nome_doador: 'Empresa ABC Ltda',
        email: 'doacoes@empresaabc.com.br',
        telefone_doador: '(11) 3555-1234',
        documento_doador: '12.345.678/0001-90',
        tipo: 'materiais_escolares',
        valor: 500.00,
        descricao_itens: 'Cadernos, Lápis, Borrachas, Mochilas',
        observacoes: 'Material para 50 crianças',
        status: 'recebida',
        usuario_id: 1,
        data_doacao: new Date('2026-02-10'),
        data_recebimento: new Date('2026-02-11')
      },
      {
        nome_doador: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        telefone_doador: '(11) 98888-7777',
        documento_doador: '789.123.456-00',
        tipo: 'dinheiro',
        valor: 1000.00,
        descricao_itens: '',
        observacoes: 'Doação em dinheiro para campanha do agasalho',
        status: 'recebida',
        usuario_id: 1,
        data_doacao: new Date('2026-02-12'),
        data_recebimento: new Date('2026-02-12')
      },
      {
        nome_doador: 'Ana Paula Silva',
        email: 'ana.paula@email.com',
        telefone_doador: '(11) 97777-6666',
        documento_doador: '321.654.987-00',
        tipo: 'outros',
        valor: 0.00,
        descricao_itens: 'Roupas, Cobertores, Sapatos',
        observacoes: 'Doação de roupas e cobertores para inverno',
        status: 'pendente',
        usuario_id: 1,
        data_doacao: new Date('2026-02-19')
      }
    ];

    // Inserir doações
    for (const doacao of doacoesExemplo) {
      await Doacao.create(doacao);
      console.log(`✅ Doação criada: ${doacao.nome_doador} - ${doacao.tipo}`);
    }

    console.log(`\n🎉 ${doacoesExemplo.length} doações de exemplo criadas com sucesso!`);
    
    // Verificar doações criadas
    const totalDoacoes = await Doacao.count();
    console.log(`📊 Total de doações no banco: ${totalDoacoes}`);

    const pendentes = await Doacao.count({ where: { status: 'pendente' } });
    const recebidas = await Doacao.count({ where: { status: 'recebida' } });
    
    console.log(`📊 Doações pendentes: ${pendentes}`);
    console.log(`📊 Doações recebidas: ${recebidas}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

seedDoacoes();
