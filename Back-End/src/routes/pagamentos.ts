import { Router } from "express";
import * as controller from "../controllers/pagamentoController";
import { autenticar, autorizar } from "../middlewares/auth";
import { PERFIS } from "../domain/perfis";

const router = Router();

router.use(autenticar);

router.get("/", autorizar(PERFIS.GERENTE), controller.retrieveAll);
router.get(
  "/pedido/:idPedido",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.CLIENTE),
  controller.retrieveByPedido,
);
router.get("/:id", autorizar(PERFIS.GERENTE), controller.retrieveOne);
router.post(
  "/",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.CLIENTE),
  controller.create,
);
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);

export default router;
