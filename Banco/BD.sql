-- Cria a tabela que registra os perfis de acesso associados aos usuários.
-- CreateTable
CREATE TABLE "tipoUsuario" (
    "idTipoUsuario" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipoUsuario_pkey" PRIMARY KEY ("idTipoUsuario")
);

-- Cria os usuários, que podem atuar como clientes, garçons ou outros perfis.
-- CreateTable
CREATE TABLE "usuario" (
    "idUsuario" SERIAL NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "loginUsuario" VARCHAR(80) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "statusUsuario" BOOLEAN NOT NULL,
    "idTipoUsuario" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- Cria os pedidos e relaciona cada pedido ao cliente e ao garçom responsáveis.
-- CreateTable
CREATE TABLE "pedido" (
    "idPedido" SERIAL NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusPedido" VARCHAR(80) NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idGarcom" INTEGER NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("idPedido")
);

-- Cria os pagamentos; o índice abaixo limita cada pedido a um pagamento.
-- CreateTable
CREATE TABLE "pagamento" (
    "idPagamento" SERIAL NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" VARCHAR(80) NOT NULL,
    "idPedido" INTEGER NOT NULL,

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("idPagamento")
);

-- Cria o catálogo de produtos e indica se cada item está disponível.
-- CreateTable
CREATE TABLE "produto" (
    "idProduto" SERIAL NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(100) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("idProduto")
);

-- Cria os itens que compõem os pedidos e registra quantidade e valores.
-- CreateTable
CREATE TABLE "itemPedido" (
    "idItemPedido" SERIAL NOT NULL,
    "subTotal" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnit" DECIMAL(10,2) NOT NULL,
    "idProduto" INTEGER NOT NULL,
    "idPedido" INTEGER NOT NULL,

    CONSTRAINT "itemPedido_pkey" PRIMARY KEY ("idItemPedido")
);

-- Impede que dois usuários compartilhem o mesmo login.
-- CreateIndex
CREATE UNIQUE INDEX "unq_login" ON "usuario"("loginUsuario");

-- Garante no máximo um registro de pagamento para cada pedido.
-- CreateIndex
CREATE UNIQUE INDEX "unq_pagamento_pedido" ON "pagamento"("idPedido");

-- Liga cada usuário ao tipo de perfil cadastrado.
-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_idTipoUsuario_fkey" FOREIGN KEY ("idTipoUsuario") REFERENCES "tipoUsuario"("idTipoUsuario") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Liga o pedido ao usuário que o realizou como cliente.
-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Liga o pedido ao usuário responsável pelo atendimento como garçom.
-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idGarcom_fkey" FOREIGN KEY ("idGarcom") REFERENCES "usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Liga o pagamento ao pedido que está sendo quitado.
-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Liga cada item à encomenda da qual ele faz parte.
-- AddForeignKey
ALTER TABLE "itemPedido" ADD CONSTRAINT "itemPedido_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Liga cada item ao produto do catálogo que foi solicitado.
-- AddForeignKey
ALTER TABLE "itemPedido" ADD CONSTRAINT "itemPedido_idProduto_fkey" FOREIGN KEY ("idProduto") REFERENCES "produto"("idProduto") ON DELETE RESTRICT ON UPDATE NO ACTION;
