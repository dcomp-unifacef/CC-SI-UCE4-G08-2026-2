-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "imagem" VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "motivoCancelamento" VARCHAR(255);
