import { Router } from "express";
import * as controller from "../controllers/pagamentoController";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, controller.retrieveAll);
router.get("/:id", authenticate, controller.retrieveOne);
router.post("/", authenticate, controller.create);
router.put("/:id", authenticate, authorizeAdmin, controller.update);
router.delete("/:id", authenticate, authorizeAdmin, controller.remove);

export default router;
