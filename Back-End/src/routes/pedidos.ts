// Router define a interface HTTP dos pedidos e delega cada operação ao controller.
import { Router } from "express";
// O controller converte parâmetros/corpos em chamadas ao pedidoService.
import * as controller from "../controllers/pedidoController";
// Middleware autentica tokens e aplica autorização específica por endpoint.
import { autenticar, autorizar } from "../middlewares/auth";
// Vocabulário comum de perfis usado para declarar quem acessa cada rota.
import { PERFIS } from "../domain/perfis";

// Router registrado por app.ts sob /pedidos.
const router = Router();

// Exige identidade autenticada em todos os endpoints seguintes.
router.use(autenticar);

// Lista pedidos respeitando filtros e visibilidade aplicados pelo controller/service.
router.get("/", controller.retrieveAll);
// Exibe fila de produção para garçom, cozinheiro ou gerente.
router.get(
  "/fila",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.retrieveFila,
);
// Busca o pedido ativo mais recente associado à mesa indicada.
router.get(
  "/mesa/:numeroMesa/ativo",
  controller.buscarAtivoDaMesa,
);
// Recupera um pedido específico; o service também restringe clientes aos próprios pedidos.
router.get("/:id", controller.retrieveOne);

// Cria pedido e seus itens para cliente, garçom ou gerente.
router.post(
  "/",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.CLIENTE),
  controller.create,
);

// Atualiza associações, estimativa ou itens enquanto as regras do domínio permitirem.
router.put(
  "/:id",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.update,
);

// Altera estado conforme transições válidas e perfil do usuário.
router.patch(
  "/:id/status",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.updateStatus,
);

// Cancela pedido com motivo obrigatório e verificação de perfil no service.
router.patch(
  "/:id/cancelar",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.cancel,
);

// Alias HTTP de cancelamento que encaminha ao mesmo fluxo controlado da operação acima.
router.delete(
  "/:id",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.cancel,
);

// Acrescenta produto ao pedido pendente.
router.post(
  "/:id/itens",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.addItem,
);

// Altera quantidade de um item identificado dentro do pedido.
router.put(
  "/:id/itens/:idItemPedido",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.updateItem,
);

// Remove item do pedido sem permitir que a comanda fique vazia.
router.delete(
  "/:id/itens/:idItemPedido",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.removeItem,
);

// Fornece as rotas ao app para montagem sob o prefixo do recurso.
export default router;
