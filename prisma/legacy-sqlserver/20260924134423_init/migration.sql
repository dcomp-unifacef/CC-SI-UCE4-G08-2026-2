BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[tipoUsuario] (
    [idTipoUsuario] INT NOT NULL IDENTITY(1,1),
    [nome] VARCHAR(50) NOT NULL,
    CONSTRAINT [tipoUsuario_pkey] PRIMARY KEY CLUSTERED ([idTipoUsuario])
);

-- CreateTable
CREATE TABLE [dbo].[usuario] (
    [idUsuario] INT NOT NULL IDENTITY(1,1),
    [nome] VARCHAR(80) NOT NULL,
    [loginUsuario] VARCHAR(80) NOT NULL,
    [senha] VARCHAR(255) NOT NULL,
    [statusUsuario] BIT NOT NULL,
    [idTipoUsuario] INT NOT NULL,
    CONSTRAINT [usuario_pkey] PRIMARY KEY CLUSTERED ([idUsuario]),
    CONSTRAINT [unq_login] UNIQUE NONCLUSTERED ([loginUsuario])
);

-- CreateTable
CREATE TABLE [dbo].[pedido] (
    [idPedido] INT NOT NULL IDENTITY(1,1),
    [valorTotal] DECIMAL(10,2) NOT NULL,
    [dataHora] DATETIME2 NOT NULL CONSTRAINT [pedido_dataHora_df] DEFAULT CURRENT_TIMESTAMP,
    [statusPedido] VARCHAR(80) NOT NULL,
    [idCliente] INT NOT NULL,
    [idGarcom] INT NOT NULL,
    CONSTRAINT [pedido_pkey] PRIMARY KEY CLUSTERED ([idPedido])
);

-- CreateTable
CREATE TABLE [dbo].[pagamento] (
    [idPagamento] INT NOT NULL IDENTITY(1,1),
    [valor] DECIMAL(10,2) NOT NULL,
    [dataHora] DATETIME2 NOT NULL CONSTRAINT [pagamento_dataHora_df] DEFAULT CURRENT_TIMESTAMP,
    [formaPagamento] VARCHAR(80) NOT NULL,
    [idPedido] INT NOT NULL,
    CONSTRAINT [pagamento_pkey] PRIMARY KEY CLUSTERED ([idPagamento]),
    CONSTRAINT [unq_pagamento_pedido] UNIQUE NONCLUSTERED ([idPedido])
);

-- CreateTable
CREATE TABLE [dbo].[produto] (
    [idProduto] INT NOT NULL IDENTITY(1,1),
    [nome] VARCHAR(80) NOT NULL,
    [preco] DECIMAL(10,2) NOT NULL,
    [descricao] VARCHAR(100) NOT NULL,
    [disponivel] BIT NOT NULL CONSTRAINT [produto_disponivel_df] DEFAULT 1,
    CONSTRAINT [produto_pkey] PRIMARY KEY CLUSTERED ([idProduto])
);

-- CreateTable
CREATE TABLE [dbo].[itemPedido] (
    [idItemPedido] INT NOT NULL IDENTITY(1,1),
    [subTotal] DECIMAL(10,2) NOT NULL,
    [quantidade] INT NOT NULL,
    [valorUnit] DECIMAL(10,2) NOT NULL,
    [idProduto] INT NOT NULL,
    [idPedido] INT NOT NULL,
    CONSTRAINT [itemPedido_pkey] PRIMARY KEY CLUSTERED ([idItemPedido])
);

-- AddForeignKey
ALTER TABLE [dbo].[usuario] ADD CONSTRAINT [usuario_idTipoUsuario_fkey] FOREIGN KEY ([idTipoUsuario]) REFERENCES [dbo].[tipoUsuario]([idTipoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido] ADD CONSTRAINT [pedido_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[usuario]([idUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido] ADD CONSTRAINT [pedido_idGarcom_fkey] FOREIGN KEY ([idGarcom]) REFERENCES [dbo].[usuario]([idUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pagamento] ADD CONSTRAINT [pagamento_idPedido_fkey] FOREIGN KEY ([idPedido]) REFERENCES [dbo].[pedido]([idPedido]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[itemPedido] ADD CONSTRAINT [itemPedido_idProduto_fkey] FOREIGN KEY ([idProduto]) REFERENCES [dbo].[produto]([idProduto]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[itemPedido] ADD CONSTRAINT [itemPedido_idPedido_fkey] FOREIGN KEY ([idPedido]) REFERENCES [dbo].[pedido]([idPedido]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
