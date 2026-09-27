-- CreateTable
CREATE TABLE "tipoUsuario" (
    "idTipoUsuario" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipoUsuario_pkey" PRIMARY KEY ("idTipoUsuario")
);

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

-- CreateTable
CREATE TABLE "pagamento" (
    "idPagamento" SERIAL NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" VARCHAR(80) NOT NULL,
    "idPedido" INTEGER NOT NULL,

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("idPagamento")
);

-- CreateTable
CREATE TABLE "produto" (
    "idProduto" SERIAL NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(100) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("idProduto")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "unq_login" ON "usuario"("loginUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "unq_pagamento_pedido" ON "pagamento"("idPedido");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_idTipoUsuario_fkey" FOREIGN KEY ("idTipoUsuario") REFERENCES "tipoUsuario"("idTipoUsuario") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idGarcom_fkey" FOREIGN KEY ("idGarcom") REFERENCES "usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemPedido" ADD CONSTRAINT "itemPedido_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemPedido" ADD CONSTRAINT "itemPedido_idProduto_fkey" FOREIGN KEY ("idProduto") REFERENCES "produto"("idProduto") ON DELETE RESTRICT ON UPDATE NO ACTION;
