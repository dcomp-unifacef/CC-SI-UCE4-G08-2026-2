// back-end/src/routes/users.ts
import { Router } from "express";
import * as controller from "../controllers/usuarioController";
import * as authController from "../controllers/authController";

const router = Router();

router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

router.post("/login", authController.login);

export default router;
