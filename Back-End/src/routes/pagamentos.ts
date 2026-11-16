// Router que publica consultas e comandos relacionados aos pagamentos.
import { Router } from "express";
// Controller valida parâmetros e delega as regras de negócio ao pagamentoService.
import * as controller from "../controllers/pagamentoController";
// Autenticação protege o recurso e autorização define os perfis permitidos.
import { autenticar, autorizar } from "../middlewares/auth";
// Perfis canônicos usados na política por endpoint.
import { PERFIS } from "../domain/perfis";

// Router montado em app.ts sob /pagamentos.
const router = Router();

// Nenhum endpoint deste recurso é público.
router.use(autenticar);

// Consulta geral e por identificador é reservada à gerência.
router.get("/", autorizar(PERFIS.GERENTE), controller.retrieveAll);
// Cliente, garçom e gerente podem consultar pagamento vinculado a pedido.
router.get(
  "/pedido/:idPedido",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.CLIENTE),
  controller.retrieveByPedido,
);
// Consulta por identificador individual, restrita à gerência.
router.get("/:id", autorizar(PERFIS.GERENTE), controller.retrieveOne);
// Registra pagamento após validações de pedido, valor, estado e unicidade no service.
router.post(
  "/",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.CLIENTE),
  controller.create,
);
// Atualização administrativa dos campos aceitos pelo service.
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);

// Disponibiliza o router para montagem na aplicação.
export default router;
