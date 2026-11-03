-- AlterTable
ALTER TABLE "pedido"
    ADD COLUMN "tempoEstimado" INTEGER,
    ADD COLUMN "idCozinheiro" INTEGER,
    ALTER COLUMN "valorTotal" SET DEFAULT 0,
    ALTER COLUMN "statusPedido" SET DEFAULT 'Pendente';

-- AlterTable
ALTER TABLE "pagamento" ADD COLUMN "status" VARCHAR(80) NOT NULL DEFAULT 'Pago';

-- DropForeignKey
ALTER TABLE "pagamento" DROP CONSTRAINT "pagamento_idPedido_fkey";

-- DropForeignKey
ALTER TABLE "itemPedido" DROP CONSTRAINT "itemPedido_idPedido_fkey";

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idCozinheiro_fkey" FOREIGN KEY ("idCozinheiro") REFERENCES "usuario"("idUsuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemPedido" ADD CONSTRAINT "itemPedido_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "pedido"("idPedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- CreateIndex
CREATE INDEX "pedido_statusPedido_idx" ON "pedido"("statusPedido");

-- CreateIndex
CREATE INDEX "pedido_idCliente_idx" ON "pedido"("idCliente");

-- CreateIndex
CREATE INDEX "pedido_idGarcom_idx" ON "pedido"("idGarcom");

-- CreateIndex
CREATE INDEX "pedido_idCozinheiro_idx" ON "pedido"("idCozinheiro");

-- CreateIndex
CREATE INDEX "itemPedido_idPedido_idx" ON "itemPedido"("idPedido");

-- CreateIndex
CREATE INDEX "itemPedido_idProduto_idx" ON "itemPedido"("idProduto");

-- CreateIndex
CREATE UNIQUE INDEX "itemPedido_idPedido_idProduto_key" ON "itemPedido"("idPedido", "idProduto");
