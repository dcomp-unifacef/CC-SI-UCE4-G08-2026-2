import { Router } from "express";
import * as controller from "../controllers/pedidoController";
import { autenticar, autorizar } from "../middlewares/auth";
import { PERFIS } from "../domain/perfis";

const router = Router();

router.use(autenticar);

//
router.get("/", controller.retrieveAll);
router.get(
  "/fila",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.retrieveFila,
);
router.get("/:id", controller.retrieveOne);

router.post(
  "/",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.create,
);

router.put(
  "/:id",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.update,
);

router.patch(
  "/:id/status",
  autorizar(PERFIS.GARCOM, PERFIS.COZINHEIRO, PERFIS.GERENTE),
  controller.updateStatus,
);

router.patch(
  "/:id/cancelar",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.cancel,
);

router.delete(
  "/:id",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.cancel,
);

router.post(
  "/:id/itens",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.addItem,
);

router.put(
  "/:id/itens/:idItemPedido",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.updateItem,
);

router.delete(
  "/:id/itens/:idItemPedido",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE),
  controller.removeItem,
);

export default router;
