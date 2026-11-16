// Router de catálogo: consultas exigem autenticação e alterações também exigem perfil de gerência.
import { Router } from "express";
// Controller traduz parâmetros e respostas, e chama produtoService.
import * as controller from "../controllers/produtoController";
// Exige autenticação e limita as operações de escrita a perfis autorizados.
import { autenticar, autorizar } from "../middlewares/auth";
// Fonte dos nomes de papéis usados na política de acesso.
import { PERFIS } from "../domain/perfis";

// Router montado no app pelo prefixo /produtos.
const router = Router();

// Protege todas as rotas, incluindo consultas do catálogo.
router.use(autenticar);

// Consultas delegadas ao service, que serializa preços decimais.
router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
// Cadastro e manutenção do catálogo são responsabilidade da gerência.
router.post("/", autorizar(PERFIS.GERENTE), controller.create);
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);
router.delete("/:id", autorizar(PERFIS.GERENTE), controller.remove);

// Exporta endpoints para composição em app.ts.
export default router;
