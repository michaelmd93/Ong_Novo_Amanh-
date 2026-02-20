const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Doacao = sequelize.define('Doacao', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Dados do doador
    nome_doador: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 150]
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    telefone_doador: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    documento_doador: {
      type: DataTypes.STRING(30),
      allowNull: true
    },

    // Informações da doação
    tipo: {
      type: DataTypes.ENUM('alimentos', 'vestuario', 'higiene', 'medicamentos', 'enxoval', 'dinheiro', 'outros'),
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    descricao_itens: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Campos exclusivos para doações em dinheiro
    forma_pagamento: {
      type: DataTypes.ENUM('pix', 'transferencia', 'dinheiro', 'cartao'),
      allowNull: true
    },
    comprovante: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    // Status e datas
    status: {
      type: DataTypes.ENUM('pendente', 'recebida', 'entregue', 'cancelada'),
      allowNull: false,
      defaultValue: 'pendente'
    },
    data_doacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    data_recebimento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    data_entrega: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    data_cancelamento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    // Auditoria
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'doacoes',
    paranoid: true
  });

  return Doacao;
};
