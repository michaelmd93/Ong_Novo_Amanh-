-- =====================================================
-- SCRIPT DE CRIAÇÃO DE TABELAS - BANCO DE DADOS MYSQL
-- PLATAFORMA ONG NOVO AMANHÃ
-- =====================================================

USE plataforma_ong;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo ENUM('admin', 'coordenador', 'professor', 'voluntario') NOT NULL DEFAULT 'voluntario',
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_login DATETIME NULL,
    avatar TEXT NULL,
    telefone VARCHAR(20) NULL,
    data_nascimento DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_cargo (cargo),
    INDEX idx_ativo (ativo)
);

-- Tabela de Professores
CREATE TABLE IF NOT EXISTS professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nasc DATE NOT NULL,
    sexo ENUM('M', 'F', 'Outro') NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(15),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    formacao VARCHAR(200) NOT NULL,
    especializacao TEXT,
    experiencia_anos INT,
    registro_profissional VARCHAR(50),
    salario DECIMAL(10, 2),
    data_admissao DATE NOT NULL DEFAULT (CURRENT_DATE),
    data_demissao DATE NULL,
    status ENUM('ativo', 'inativo', 'licenca', 'ferias') NOT NULL DEFAULT 'ativo',
    carga_horaria_semanal INT,
    observacoes TEXT,
    foto_url VARCHAR(500),
    usuario_id INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_cpf (cpf),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_ativo (ativo),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    categoria ENUM('informatica', 'artesanato', 'culinaria', 'idiomas', 'musica', 'esportes', 'reforco_escolar', 'profissionalizante', 'outros') NOT NULL DEFAULT 'outros',
    nivel ENUM('iniciante', 'intermediario', 'avancado') NOT NULL DEFAULT 'iniciante',
    carga_horaria_total INT NOT NULL,
    duracao_meses INT NOT NULL,
    idade_minima INT,
    idade_maxima INT,
    vagas_disponiveis INT NOT NULL,
    vagas_ocupadas INT DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    dias_semana JSON NOT NULL,
    local VARCHAR(200) NOT NULL,
    sala VARCHAR(50),
    material_necessario TEXT,
    pre_requisitos TEXT,
    objetivos TEXT,
    metodologia TEXT,
    avaliacao TEXT,
    certificado BOOLEAN DEFAULT TRUE,
    valor_curso DECIMAL(10, 2) DEFAULT 0.00,
    gratuito BOOLEAN DEFAULT TRUE,
    status ENUM('planejado', 'inscricoes_abertas', 'em_andamento', 'concluido', 'cancelado', 'suspenso') NOT NULL DEFAULT 'planejado',
    professor_id INT NOT NULL,
    usuario_id INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_codigo (codigo),
    INDEX idx_status (status),
    INDEX idx_professor (professor_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_categoria (categoria),
    INDEX idx_ativo (ativo)
);

-- Tabela de Alunos
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nasc DATE NOT NULL,
    sexo ENUM('M', 'F', 'Outro') NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(15),
    whatsapp VARCHAR(15),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    nome_responsavel VARCHAR(100),
    cpf_responsavel VARCHAR(14),
    telefone_responsavel VARCHAR(15),
    email_responsavel VARCHAR(100),
    parentesco_responsavel VARCHAR(50),
    escola VARCHAR(100),
    serie VARCHAR(50),
    turno_escola ENUM('manha', 'tarde', 'noite', 'integral'),
    deficiencia TEXT,
    alergias TEXT,
    medicamentos TEXT,
    observacoes_medicas TEXT,
    data_inscricao DATE NOT NULL DEFAULT (CURRENT_DATE),
    status ENUM('ativo', 'inativo', 'pendente', 'desistente') NOT NULL DEFAULT 'pendente',
    usuario_id INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_cpf (cpf),
    INDEX idx_status (status),
    INDEX idx_usuario (usuario_id),
    INDEX idx_ativo (ativo)
);

-- Tabela de Salas
CREATE TABLE IF NOT EXISTS salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    capacidade_maxima INT NOT NULL DEFAULT 30,
    local VARCHAR(200) NOT NULL,
    andar VARCHAR(20),
    recursos JSON,
    status ENUM('disponivel', 'ocupada', 'manutencao', 'reservada') NOT NULL DEFAULT 'disponivel',
    professor_id INT,
    usuario_id INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_codigo (codigo),
    INDEX idx_status (status),
    INDEX idx_professor (professor_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_ativo (ativo)
);

-- Tabela de SalaAluno (relacionamento muitos-para-muitos)
CREATE TABLE IF NOT EXISTS sala_alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    aluno_id INT NOT NULL,
    data_matricula DATE NOT NULL DEFAULT (CURRENT_DATE),
    status ENUM('ativo', 'inativo', 'concluido', 'desistente') NOT NULL DEFAULT 'ativo',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_sala_aluno (sala_id, aluno_id),
    INDEX idx_sala (sala_id),
    INDEX idx_aluno (aluno_id),
    INDEX idx_status (status)
);

-- Tabela de Chamadas
CREATE TABLE IF NOT EXISTS chamadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    data_chamada DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    total_alunos INT NOT NULL DEFAULT 0,
    presentes INT NOT NULL DEFAULT 0,
    ausentes INT NOT NULL DEFAULT 0,
    observacoes TEXT,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_sala (sala_id),
    INDEX idx_data (data_chamada),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de ChamadaRegistros
CREATE TABLE IF NOT EXISTS chamada_registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamada_id INT NOT NULL,
    aluno_id INT NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT FALSE,
    horario_chegada TIME NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chamada_id) REFERENCES chamadas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chamada_aluno (chamada_id, aluno_id),
    INDEX idx_chamada (chamada_id),
    INDEX idx_aluno (aluno_id),
    INDEX idx_presente (presente)
);

-- Tabela de Doacoes
CREATE TABLE IF NOT EXISTS doacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_doador VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(18),
    email VARCHAR(100),
    telefone VARCHAR(15),
    endereco VARCHAR(200),
    tipo_doacao ENUM('dinheiro', 'material', 'servico', 'outro') NOT NULL,
    descricao TEXT,
    valor DECIMAL(10, 2),
    data_doacao DATE NOT NULL DEFAULT (CURRENT_DATE),
    status ENUM('pendente', 'confirmada', 'recebida', 'cancelada') NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tipo (tipo_doacao),
    INDEX idx_status (status),
    INDEX idx_data (data_doacao),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de ActionLogs
CREATE TABLE IF NOT EXISTS action_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(50) NOT NULL,
    registro_id INT,
    dados_antigos JSON,
    dados_novos JSON,
    ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_tabela (tabela),
    INDEX idx_data (created_at)
);

-- Tabela de PasswordReset
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    expirado BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_uso TIMESTAMP NULL,
    ip VARCHAR(45),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo ENUM('reuniao', 'palestra', 'workshop', 'festa', 'esporte', 'cultural', 'outro') NOT NULL DEFAULT 'outro',
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    local VARCHAR(200) NOT NULL,
    capacidade_maxima INT,
    inscricoes_abertas BOOLEAN DEFAULT TRUE,
    data_limite_inscricao DATETIME,
    observacoes TEXT,
    status ENUM('planejado', 'inscricoes_abertas', 'em_andamento', 'concluido', 'cancelado') NOT NULL DEFAULT 'planejado',
    criado_por INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tipo (tipo),
    INDEX idx_status (status),
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_criado_por (criado_por),
    INDEX idx_ativo (ativo)
);

-- Tabela de EventoParticipantes
CREATE TABLE IF NOT EXISTS evento_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmado', 'pendente', 'cancelado') NOT NULL DEFAULT 'confirmado',
    observacoes TEXT,
    
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_evento_usuario (evento_id, usuario_id),
    INDEX idx_evento (evento_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status)
);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo_documento ENUM('relatorio', 'ata', 'plano', 'contrato', 'certificado', 'outro') NOT NULL DEFAULT 'outro',
    caminho_arquivo VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_arquivo BIGINT,
    tipo_mime VARCHAR(100),
    categoria VARCHAR(50),
    tags JSON,
    visibilidade ENUM('publico', 'interno', 'restrito') NOT NULL DEFAULT 'interno',
    status ENUM('ativo', 'arquivado', 'excluido') NOT NULL DEFAULT 'ativo',
    criado_por INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tipo (tipo_documento),
    INDEX idx_categoria (categoria),
    INDEX idx_status (status),
    INDEX idx_criado_por (criado_por),
    INDEX idx_ativo (ativo),
    INDEX idx_visibilidade (visibilidade)
);

-- Inserir dados iniciais
INSERT IGNORE INTO usuarios (nome, email, senha, cargo) VALUES 
('Administrador', 'admin@ong.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'admin');

-- Mostrar resultado
SELECT 'Banco de dados e tabelas criados com sucesso!' AS mensagem;
