-- DropForeignKey
ALTER TABLE "pedido" DROP CONSTRAINT "pedido_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "pedido" DROP CONSTRAINT "pedido_idGarcom_fkey";

-- AlterTable: adiciona a coluna como opcional para permitir o backfill
ALTER TABLE "pedido" ADD COLUMN "numeroMesa" INTEGER;

-- Backfill: pedidos antigos ficam na mesa 1
UPDATE "pedido" SET "numeroMesa" = 1 WHERE "numeroMesa" IS NULL;

ALTER TABLE "pedido" ALTER COLUMN "numeroMesa" SET NOT NULL;
ALTER TABLE "pedido" ALTER COLUMN "idCliente" DROP NOT NULL;
ALTER TABLE "pedido" ALTER COLUMN "idGarcom" DROP NOT NULL;

-- Garante no banco um único pedido ativo por mesa
CREATE UNIQUE INDEX "unq_pedido_mesa_ativo" ON "pedido"("numeroMesa")
WHERE "statusPedido" NOT IN ('Pago', 'Cancelado');

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "usuario"("idUsuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_idGarcom_fkey" FOREIGN KEY ("idGarcom") REFERENCES "usuario"("idUsuario") ON DELETE SET NULL ON UPDATE NO ACTION;
