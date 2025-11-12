const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      cargo: user.cargo 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Login
const login = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        error: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const senhaValida = await user.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    await user.update({ ultimo_login: new Date() });

    // Gerar token
    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Registro de novo usuário
const register = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha, cargo, telefone, data_nascimento } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email: email.toLowerCase(),
      senha,
      cargo: cargo || 'voluntario',
      telefone,
      data_nascimento
    });

    // Gerar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = req.user; // Vem do middleware de autenticação

    res.json({
      valid: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar,
        ultimo_login: user.ultimo_login
      }
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Logout (invalidar token - implementação simples)
const logout = async (req, res) => {
  try {
    // Em uma implementação mais robusta, você manteria uma blacklist de tokens
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  login,
  register,
  verifyToken,
  logout
};
