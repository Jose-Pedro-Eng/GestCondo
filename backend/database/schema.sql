-- DDL para Sistema de Gestão de Condomínio Universitário
-- SQL Dialect: MySQL 8.0 / InnoDB
-- CHARSET: utf8mb4_unicode_ci

-- Tabela de Usuários (Base para Autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Gestor', 'Morador') NOT NULL DEFAULT 'Morador',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    INDEX idx_usuario_email (email)
) ENGINE=InnoDB;

-- Tabela de Unidades (Apartamentos/Quartos)
CREATE TABLE IF NOT EXISTS unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bloco VARCHAR(50) NOT NULL,
    numero VARCHAR(50) NOT NULL,
    status ENUM('Vago', 'Ocupado', 'Manutenção') NOT NULL DEFAULT 'Vago',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    UNIQUE KEY uni_bloco_numero (bloco, numero)
) ENGINE=InnoDB;

-- Tabela de Moradores (Dados Específicos)
CREATE TABLE IF NOT EXISTS moradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    unidade_id INT,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    curso VARCHAR(100),
    data_entrada DATE,
    data_saida DATE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_morador_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_morador_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON DELETE SET NULL,
    INDEX idx_morador_cpf (cpf)
) ENGINE=InnoDB;

-- Tabela de Lançamentos Financeiros (Boleto/PIX)
CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    morador_id INT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    vencimento DATE NOT NULL,
    data_pagamento DATETIME,
    descricao TEXT,
    tipo ENUM('aluguel', 'condominio', 'outros') NOT NULL,
    status ENUM('pendente', 'pago', 'cancelado') NOT NULL DEFAULT 'pendente',
    linha_digitavel VARCHAR(255),
    qr_code_url TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_financeiro_morador FOREIGN KEY (morador_id) REFERENCES moradores(id),
    INDEX idx_financeiro_morador_status (morador_id, status)
) ENGINE=InnoDB;

-- Tabela de Áreas Comuns
CREATE TABLE IF NOT EXISTS areas_comuns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    regras_uso TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

-- Tabela de Reservas de Área
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    morador_id INT NOT NULL,
    data_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM('pendente', 'aprovada', 'recusada') NOT NULL DEFAULT 'pendente',
    motivo_recusa TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_reserva_area FOREIGN KEY (area_id) REFERENCES areas_comuns(id),
    CONSTRAINT fk_reserva_morador FOREIGN KEY (morador_id) REFERENCES moradores(id)
) ENGINE=InnoDB;

-- Tabela de Mensagens (Chat 1-para-1)
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_msg_remetente FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_msg_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    INDEX idx_mensagens_dest_lida (destinatario_id, lida)
) ENGINE=InnoDB;

-- Tabela de Comunicados (Broadcast)
CREATE TABLE IF NOT EXISTS comunicados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestor_id INT NOT NULL,
    titulo VARCHAR(191) NOT NULL,
    conteudo TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_comunicado_gestor FOREIGN KEY (gestor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- Tabela de Leitura de Comunicados
CREATE TABLE IF NOT EXISTS comunicado_leituras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    morador_id INT NOT NULL,
    comunicado_id INT NOT NULL,
    data_leitura DATETIME NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_leitura_morador FOREIGN KEY (morador_id) REFERENCES moradores(id),
    CONSTRAINT fk_leitura_comunicado FOREIGN KEY (comunicado_id) REFERENCES comunicados(id) ON DELETE CASCADE
) ENGINE=InnoDB;
