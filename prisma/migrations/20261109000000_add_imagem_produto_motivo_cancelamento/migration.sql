-- Adiciona caminho de imagem obrigatório; registros anteriores começam com caminho vazio.
-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "imagem" VARCHAR(255) NOT NULL DEFAULT '';

-- Permite registrar o motivo informado ao cancelar um pedido.
-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "motivoCancelamento" VARCHAR(255);
