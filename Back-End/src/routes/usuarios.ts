import { Router } from "express";
import * as controller from "../controllers/usuarioController";
import * as authController from "../controllers/authController";
import { autenticar, autorizar } from "../middlewares/auth";
import { PERFIS } from "../domain/perfis";

const router = Router();

router.post("/login", authController.login);

router.use(autenticar);

router.get("/", autorizar(PERFIS.GARCOM, PERFIS.GERENTE), controller.retrieveAll);
router.get("/:id", autorizar(PERFIS.GARCOM, PERFIS.GERENTE), controller.retrieveOne);
router.post("/", autorizar(PERFIS.GERENTE), controller.create);
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);
router.delete("/:id", autorizar(PERFIS.GERENTE), controller.remove);

export default router;
