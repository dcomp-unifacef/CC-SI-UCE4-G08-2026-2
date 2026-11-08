import { Router } from "express";
import * as controller from "../controllers/produtoController";
import { autenticar, autorizar } from "../middlewares/auth";
import { PERFIS } from "../domain/perfis";

const router = Router();

router.use(autenticar);

router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
router.post("/", autorizar(PERFIS.GERENTE), controller.create);
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);
router.delete("/:id", autorizar(PERFIS.GERENTE), controller.remove);

export default router;
