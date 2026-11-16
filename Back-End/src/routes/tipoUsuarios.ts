import { Router } from "express";
// Router que administra tipos/perfis vinculados aos usuários.
// Controller valida IDs e transfere operações para tipoUsuarioService.
import * as controller from "../controllers/tipoUsuarioController";
// Exige token e restringe alterações de perfil à gerência.
import { autenticar, autorizar } from "../middlewares/auth";
// Catálogo canônico de papéis usado na regra de acesso.
import { PERFIS } from "../domain/perfis";

// Router montado sob /tipo-usuarios na aplicação.
const router = Router();

// Todas as rotas exigem autenticação.
router.use(autenticar);

// Consultas dos tipos existentes.
router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
// Alterações de tipos são administrativas e tratadas pelo service/repository.
router.post("/", autorizar(PERFIS.GERENTE), controller.create);
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);
router.delete("/:id", autorizar(PERFIS.GERENTE), controller.remove);

// Exporta o router para app.ts.
export default router;
