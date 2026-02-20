-- Migration: Evolução do módulo de doações v2
-- Adiciona: novas categorias, status 'entregue', forma_pagamento, comprovante, quantidade, data_entrega

-- 1. Atualizar ENUM de tipo para incluir novas categorias
ALTER TABLE doacoes MODIFY COLUMN tipo ENUM('alimentos', 'vestuario', 'higiene', 'medicamentos', 'enxoval', 'dinheiro', 'outros') NOT NULL;

-- 2. Atualizar ENUM de status para incluir 'entregue'
ALTER TABLE doacoes MODIFY COLUMN status ENUM('pendente', 'recebida', 'entregue', 'cancelada') NOT NULL DEFAULT 'pendente';

-- 3. Adicionar coluna quantidade
ALTER TABLE doacoes ADD COLUMN IF NOT EXISTS quantidade INT NULL AFTER valor;

-- 4. Adicionar coluna forma_pagamento (para doações em dinheiro)
ALTER TABLE doacoes ADD COLUMN IF NOT EXISTS forma_pagamento ENUM('pix', 'transferencia', 'dinheiro', 'cartao') NULL AFTER observacoes;

-- 5. Adicionar coluna comprovante (caminho do arquivo)
ALTER TABLE doacoes ADD COLUMN IF NOT EXISTS comprovante VARCHAR(500) NULL AFTER forma_pagamento;

-- 6. Adicionar coluna data_entrega
ALTER TABLE doacoes ADD COLUMN IF NOT EXISTS data_entrega DATE NULL AFTER data_recebimento;

-- Verificar resultado
DESCRIBE doacoes;
