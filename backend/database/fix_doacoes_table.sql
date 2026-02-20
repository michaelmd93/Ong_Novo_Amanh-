-- Corrigir estrutura da tabela doacoes para compatibilidade com o modelo
USE plataforma_ong;

-- 1. Adicionar colunas faltantes
ALTER TABLE doacoes 
ADD COLUMN telefone_doador VARCHAR(30) NULL AFTER email,
ADD COLUMN data_recebimento DATE NULL AFTER data_doacao,
ADD COLUMN data_cancelamento DATE NULL AFTER data_recebimento,
ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at;

-- 2. Modificar colunas existentes para compatibilidade
-- Mudar cpf_cnpj para documento_doador (mantendo compatibilidade)
ALTER TABLE doacoes CHANGE COLUMN cpf_cnpj documento_doador VARCHAR(30) NULL;

-- Mudar tipo_doacao para tipo (atualizar o ENUM)
ALTER TABLE doacoes 
CHANGE COLUMN tipo_doacao tipo ENUM('alimentos', 'materiais_higiene', 'materiais_escolares', 'dinheiro', 'outros') NOT NULL;

-- Mudar descricao para descricao_itens
ALTER TABLE doacoes CHANGE COLUMN descricao descricao_itens TEXT NULL;

-- Mudar nome_doador para VARCHAR(150) para compatibilidade
ALTER TABLE doacoes MODIFY COLUMN nome_doador VARCHAR(150) NOT NULL;

-- Mudar email para VARCHAR(150) para compatibilidade
ALTER TABLE doacoes MODIFY COLUMN email VARCHAR(150) NULL;

-- 3. Remover coluna endereco (não usada no modelo)
ALTER TABLE doacoes DROP COLUMN endereco;

-- 4. Atualizar ENUM de status (remover 'confirmada' se não existir no modelo)
-- Nota: Vamos manter 'confirmada' por enquanto para não perder dados

-- 5. Adicionar índices para performance
ALTER TABLE doacoes ADD INDEX idx_telefone_doador (telefone_doador);
ALTER TABLE doacoes ADD INDEX idx_data_recebimento (data_recebimento);
ALTER TABLE doacoes ADD INDEX idx_data_cancelamento (data_cancelamento);
ALTER TABLE doacoes ADD INDEX idx_deleted_at (deleted_at);

-- 6. Atualizar dados existentes para compatibilidade
-- Converter tipos antigos para novos
UPDATE doacoes SET tipo = CASE 
    WHEN tipo = 'material' THEN 'materiais_higiene'
    WHEN tipo = 'servico' THEN 'outros'
    ELSE tipo
END WHERE tipo IN ('material', 'servico');

-- 7. Mostrar resultado
SELECT 'Estrutura da tabela doacoes corrigida com sucesso!' AS mensagem;

-- 8. Verificar estrutura final
DESCRIBE doacoes;
