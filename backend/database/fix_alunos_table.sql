-- Adicionar colunas faltantes na tabela alunos
USE plataforma_ong;

-- Adicionar coluna status
ALTER TABLE alunos ADD COLUMN status ENUM('matriculado', 'inativo', 'cancelado', 'formado', 'aguardando_vaga') NOT NULL DEFAULT 'matriculado' AFTER ativo;

-- Adicionar colunas de estatísticas de frequência
ALTER TABLE alunos ADD COLUMN total_presencas INT NOT NULL DEFAULT 0 COMMENT 'Total de presenças registradas - uso analítico' AFTER documentos;
ALTER TABLE alunos ADD COLUMN total_faltas INT NOT NULL DEFAULT 0 COMMENT 'Total de faltas registradas - uso analítico' AFTER total_presencas;
ALTER TABLE alunos ADD COLUMN ultima_atualizacao_frequencia DATETIME NULL COMMENT 'Última atualização dos dados de frequência' AFTER total_faltas;

-- Adicionar coluna deleted_at para soft delete
ALTER TABLE alunos ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at;

-- Adicionar índices para performance
ALTER TABLE alunos ADD INDEX idx_status (status);
ALTER TABLE alunos ADD INDEX idx_deleted_at (deleted_at);

-- Mostrar resultado
SELECT 'Colunas adicionadas com sucesso!' AS mensagem;
