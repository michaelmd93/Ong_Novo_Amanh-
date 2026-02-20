const { Doacao, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');

// Listar doações com filtros
const getDoacoes = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, tipo, status, data_inicio, data_fim, data } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { nome_doador: { [Op.like]: `%${search}%` } },
        { descricao_itens: { [Op.like]: `%${search}%` } },
        { observacoes: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (status) {
      where.status = status;
    }

    // Filtro por intervalo de datas
    if (data_inicio && data_fim) {
      where.data_doacao = {
        [Op.between]: [data_inicio, data_fim]
      };
    } else if (data_inicio) {
      where.data_doacao = {
        [Op.gte]: data_inicio
      };
    } else if (data_fim) {
      where.data_doacao = {
        [Op.lte]: data_fim
      };
    } else if (data) {
      where.data_doacao = data;
    }

    const { count, rows } = await Doacao.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_doacao', 'DESC']],
      include: [
        {
          model: User,
          as: 'usuario_registro',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    res.json({
      doacoes: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova doação
const createDoacao = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      nome_doador,
      email,
      telefone_doador,
      documento_doador,
      tipo,
      valor,
      quantidade,
      descricao_itens,
      observacoes,
      forma_pagamento,
      status
    } = req.body;

    const dadosDoacao = {
      nome_doador,
      email,
      telefone_doador,
      documento_doador,
      tipo,
      valor: valor || null,
      quantidade: quantidade || null,
      descricao_itens,
      observacoes,
      status: status || 'pendente',
      usuario_id: req.user ? req.user.id : null
    };

    // Campos exclusivos para doações em dinheiro
    if (tipo === 'dinheiro' && forma_pagamento) {
      dadosDoacao.forma_pagamento = forma_pagamento;
    }

    // Comprovante via upload (multer)
    if (req.file) {
      dadosDoacao.comprovante = '/uploads/comprovantes/' + req.file.filename;
    }

    const doacao = await Doacao.create(dadosDoacao);

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      novos: doacao
    });

    res.status(201).json({
      message: 'Doação registrada com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao criar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Confirmar recebimento da doação
const confirmarDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'recebida',
      data_recebimento: new Date(),
      data_cancelamento: null
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao
    });

    res.json({
      message: 'Recebimento confirmado com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao confirmar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Marcar doação como entregue
const entregarDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    if (doacao.status !== 'recebida') {
      return res.status(400).json({ error: 'Apenas doações recebidas podem ser marcadas como entregues' });
    }

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'entregue',
      data_entrega: new Date()
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao
    });

    res.json({
      message: 'Doação marcada como entregue com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao entregar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar status da doação
const atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: novoStatus } = req.body;

    const statusValidos = ['pendente', 'recebida', 'entregue', 'cancelada'];
    if (!statusValidos.includes(novoStatus)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const doacao = await Doacao.findByPk(id);
    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    const updateData = { status: novoStatus };

    if (novoStatus === 'recebida') updateData.data_recebimento = new Date();
    if (novoStatus === 'entregue') updateData.data_entrega = new Date();
    if (novoStatus === 'cancelada') updateData.data_cancelamento = new Date();

    await doacao.update(updateData);

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao
    });

    res.json({ message: 'Status atualizado com sucesso', doacao });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Cancelar doação
const cancelarDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'cancelada',
      data_cancelamento: new Date()
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao
    });

    res.json({
      message: 'Doação cancelada com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao cancelar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar doações na lixeira
const getLixeira = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      deletedAt: { [Op.not]: null }
    };

    if (search) {
      where[Op.or] = [
        { nome_doador: { [Op.like]: `%${search}%` } },
        { observacoes: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Doacao.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['deletedAt', 'DESC']],
      paranoid: false,
      include: [{
        model: User,
        as: 'usuario_registro',
        attributes: ['id', 'nome', 'email'],
        required: false
      }]
    });

    res.json({
      doacoes: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar lixeira de doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Restaurar doação
const restoreDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const doacao = await Doacao.findByPk(id, { paranoid: false });

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    if (!doacao.deletedAt) {
      return res.status(400).json({ error: 'Doação não está na lixeira' });
    }

    await doacao.restore();

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'doacoes',
      registroId: doacao.id,
      novos: doacao
    });

    res.json({
      message: 'Doação restaurada com sucesso',
      doacao
    });

  } catch (error) {
    console.error('Erro ao restaurar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getDoacoes,
  createDoacao,
  confirmarDoacao,
  entregarDoacao,
  atualizarStatus,
  cancelarDoacao,
  getLixeira,
  restoreDoacao
};
