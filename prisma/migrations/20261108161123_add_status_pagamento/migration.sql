-- Registra a situação do pagamento; registros existentes recebem por padrão o estado Pago.
-- AlterTable
ALTER TABLE "pagamento" ADD COLUMN     "status" VARCHAR(80) NOT NULL DEFAULT 'Pago';
