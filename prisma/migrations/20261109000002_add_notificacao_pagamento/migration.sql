-- CreateTable
CREATE TABLE "notificacaoPagamento" (
    "idNotificacao" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "numeroMesa" INTEGER NOT NULL,
    "metodoPagamento" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notificacaoPagamento_pkey" PRIMARY KEY ("idNotificacao")
);

-- AddForeignKey
ALTER TABLE "notificacaoPagamento" ADD CONSTRAINT "notificacaoPagamento_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE RESTRICT ON UPDATE NO ACTION;
