import { Router } from "express";
import * as controller from "../controllers/produtoController";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
router.post("/", authenticate, authorizeAdmin, controller.create);
router.put("/:id", authenticate, authorizeAdmin, controller.update);
router.delete("/:id", authenticate, authorizeAdmin, controller.remove);

export default router;
