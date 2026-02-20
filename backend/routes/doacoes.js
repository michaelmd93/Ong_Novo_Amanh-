const express = require('express');
const { body, param, query } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { uploadComprovante } = require('../middleware/uploadMiddleware');
const {
  getDoacoes,
  createDoacao,
  confirmarDoacao,
  entregarDoacao,
  atualizarStatus,
  cancelarDoacao,
  getLixeira,
  restoreDoacao
} = require('../controllers/doacoesController');

const router = express.Router();

// Rotas protegidas
router.use(authMiddleware);

// Rota de lixeira (admin)
router.get('/lixeira', requireRole(['admin']), getLixeira);

// Validações para filtros (inclui intervalo de datas)
const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('tipo').optional().isIn(['alimentos', 'vestuario', 'higiene', 'medicamentos', 'enxoval', 'dinheiro', 'outros']),
  query('status').optional().isIn(['pendente', 'recebida', 'entregue', 'cancelada']),
  query('data').optional().isISO8601(),
  query('data_inicio').optional().isISO8601(),
  query('data_fim').optional().isISO8601()
];

// Validações para criação de doação
const doacaoValidation = [
  body('nome_doador')
    .isLength({ min: 2, max: 150 })
    .withMessage('Nome do doador deve ter entre 2 e 150 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email do doador inválido'),
  body('tipo')
    .isIn(['alimentos', 'vestuario', 'higiene', 'medicamentos', 'enxoval', 'dinheiro', 'outros'])
    .withMessage('Tipo de doação inválido'),
  body('valor')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor deve ser um número positivo'),
  body('quantidade')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro positivo'),
  body('forma_pagamento')
    .optional()
    .isIn(['pix', 'transferencia', 'dinheiro', 'cartao'])
    .withMessage('Forma de pagamento inválida'),
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
];

// Validação para ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

// Rotas
router.get('/', listValidation, getDoacoes);
router.post('/', uploadComprovante.single('comprovante'), doacaoValidation, createDoacao);

// Atualizar status genérico
router.patch('/:id/status',
  idValidation,
  requireRole(['admin', 'secretaria']),
  atualizarStatus
);

router.patch('/:id/confirmar', 
  idValidation, 
  requireRole(['admin', 'secretaria']), 
  confirmarDoacao
);

router.patch('/:id/entregar',
  idValidation,
  requireRole(['admin', 'secretaria']),
  entregarDoacao
);

router.patch('/:id/cancelar', 
  idValidation, 
  requireRole(['admin']), 
  cancelarDoacao
);

// Restaurar da lixeira (apenas admin)
router.post('/:id/restore',
  idValidation,
  requireRole(['admin']),
  restoreDoacao
);

module.exports = router;
