Create DATABASE ChicDog

use ChicDog

create TABLE tipoUsuario(
    idTipoUsuario int CONSTRAINT pk_IdTipoUsuario PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(50) NOT NULL
)

CREATE TABLE usuario(
    idUsuario int CONSTRAINT pk_idUsuario PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(80) NOT NULL,
    loginUsuario VARCHAR(80) CONSTRAINT unq_login UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    statusUsuario BIT NOT NULL, -- bit é "o tipo booleano " de sql Server
    idTipoUsuario INT CONSTRAINT fk_idTipoUsuario FOREIGN KEY REFERENCES tipoUsuario(idTipoUsuario) NOT NULL

)

CREATE TABLE pedido(
    idPedido int CONSTRAINT pk_idPedido PRIMARY KEY IDENTITY(1,1),
    valorTotal DECIMAL(10,2) NOT NULL,
    dataHora DATETIME2 NOT NULL DEFAULT GETDATE(),
    statusPedido VARCHAR(80) CONSTRAINT chk_statusPedido check(statusPedido in('PENDENTE', 'EM PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO')) not NULL,
    idCliente int NOT NULL CONSTRAINT fk_idCliente FOREIGN KEY REFERENCES usuario(idUsuario),
    idGarcom int NOT NULL CONSTRAINT fk_idGarcom FOREIGN KEY REFERENCES usuario(idUsuario)
)

CREATE TABLE pagamento(
    idPagamento int CONSTRAINT pk_idPagamento PRIMARY KEY IDENTITY(1,1),
    valor DECIMAL(10,2) NOT NULL,
    dataHora DATETIME2 NOT NULL DEFAULT GETDATE(),
    formaPagamento VARCHAR(80) NOT NULL,
    idPedido int NOT NULL CONSTRAINT fk_idPedido REFERENCES pedido(idPedido),
    CONSTRAINT unq_pagamento_pedido UNIQUE (idPedido)
)

CREATE TABLE produto(
    idProduto int CONSTRAINT pk_idProduto PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(80) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    disponivel bit NOT NULL CONSTRAINT df_disponivel DEFAULT(1)
)

CREATE TABLE itemPedido(
    idItemPedido int CONSTRAINT pk_idItemPedido PRIMARY KEY IDENTITY(1,1),
    subTotal DECIMAL(10,2) NOT NULL,
    quantidade int NOT NULL CONSTRAINT chk_qntItemPedido CHECK(quantidade > 0),
    valorUnit DECIMAL(10,2) NOT NULL,
    idProduto int CONSTRAINT fk_idProduto REFERENCES produto(idProduto) NOT NULL,
    idPedido int CONSTRAINT fk_idPedido_itemPedido REFERENCES pedido(idPedido) NOT NULL 
)

