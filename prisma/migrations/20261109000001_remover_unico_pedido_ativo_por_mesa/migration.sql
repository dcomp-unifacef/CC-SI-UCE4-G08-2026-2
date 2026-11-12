-- Remove a restrição de um único pedido ativo por mesa
-- para permitir que o cliente sempre abra novos pedidos,
-- independentemente do status do pedido anterior da mesa.
DROP INDEX IF EXISTS "unq_pedido_mesa_ativo";
