import { Router } from "express";
import * as controller from "../controllers/tipoUsuarioController";

const router = Router();
router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

// O app.ts atual carrega as rotas com require().
module.exports = router;
