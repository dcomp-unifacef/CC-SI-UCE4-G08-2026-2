import { Router } from "express";
import * as authController from "../controllers/authController";
import * as controller from "../controllers/usuarioController";
import {
  authenticate,
  authorizeAdmin,
  authorizeSelfOrAdmin,
  optionalAuthenticate,
} from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", authController.login);
router.post("/", optionalAuthenticate, controller.create);

router.get("/", authenticate, authorizeAdmin, controller.retrieveAll);
router.get("/:id", authenticate, authorizeSelfOrAdmin, controller.retrieveOne);
router.put("/:id", authenticate, authorizeSelfOrAdmin, controller.update);
router.delete("/:id", authenticate, authorizeAdmin, controller.remove);

export default router;
