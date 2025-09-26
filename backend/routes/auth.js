const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const { login, register, verifyToken, logout } = require('../controllers/authController');

const router = express.Router();

// Validações para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para registro
const registerValidation = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('cargo')
    .optional()
    .isIn(['admin', 'coordenador', 'professor', 'voluntario'])
    .withMessage('Cargo inválido'),
  body('telefone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  body('data_nascimento')
    .optional()
    .isDate()
    .withMessage('Data de nascimento inválida')
];

// Rotas públicas
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

// Rotas protegidas
router.get('/verify', authMiddleware, verifyToken);
router.post('/logout', authMiddleware, logout);

module.exports = router;
