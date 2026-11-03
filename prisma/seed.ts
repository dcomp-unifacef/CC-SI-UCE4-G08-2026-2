import { hash } from "bcryptjs";
import { prisma } from "../Back-End/src/database/client";

const TIPOS_USUARIO = [
  "Administrador",
  "Gerente",
  "Garçom",
  "Cozinheiro",
  "Cliente",
];

async function garantirTipoUsuario(nome: string) {
  const existente = await prisma.tipoUsuario.findFirst({ where: { nome } });

  if (existente) return existente;

  return prisma.tipoUsuario.create({ data: { nome } });
}

async function garantirUsuario(
  nome: string,
  loginUsuario: string,
  senha: string,
  idTipoUsuario: number,
) {
  const senhaHash = await hash(senha, 8);

  return prisma.usuario.upsert({
    where: { loginUsuario },
    update: {
      nome,
      senha: senhaHash,
      statusUsuario: true,
      idTipoUsuario,
    },
    create: {
      nome,
      loginUsuario,
      senha: senhaHash,
      statusUsuario: true,
      idTipoUsuario,
    },
  });
}

async function main() {
  for (const nome of TIPOS_USUARIO) {
    await garantirTipoUsuario(nome);
  }

  const tipoAdministrador = await garantirTipoUsuario("Administrador");
  const tipoGerente = await garantirTipoUsuario("Gerente");
  const tipoGarcom = await garantirTipoUsuario("Garçom");
  const tipoCozinheiro = await garantirTipoUsuario("Cozinheiro");
  const tipoCliente = await garantirTipoUsuario("Cliente");

  await garantirUsuario(
    process.env.SEED_ADMIN_NOME ?? "Administrador",
    process.env.SEED_ADMIN_LOGIN ?? "admin",
    process.env.SEED_ADMIN_SENHA ?? "admin123",
    tipoAdministrador.idTipoUsuario,
  );

  await garantirUsuario(
    "Gerente Chic Dog",
    "gerente",
    "gerente123",
    tipoGerente.idTipoUsuario,
  );

  await garantirUsuario(
    "Garçom Chic Dog",
    "garcom",
    "garcom123",
    tipoGarcom.idTipoUsuario,
  );

  await garantirUsuario(
    "Cozinheiro Chic Dog",
    "cozinheiro",
    "cozinheiro123",
    tipoCozinheiro.idTipoUsuario,
  );

  await garantirUsuario(
    "Cliente Chic Dog",
    "cliente",
    "cliente123",
    tipoCliente.idTipoUsuario,
  );

  const totalProdutos = await prisma.produto.count();

  if (totalProdutos === 0) {
    await prisma.produto.createMany({
      data: [
        {
          nome: "Cachorro-quente tradicional",
          preco: 12.5,
          descricao: "Pão, salsicha, molho e batata palha",
        },
        {
          nome: "Cachorro-quente completo",
          preco: 18.9,
          descricao: "Pão, salsicha, queijo, bacon e molhos",
        },
        {
          nome: "Batata frita",
          preco: 15,
          descricao: "Porção de batata frita crocante",
        },
        {
          nome: "Refrigerante lata",
          preco: 6,
          descricao: "Lata de 350 ml",
        },
      ],
    });
  }

  console.log("Seed concluído com sucesso.");
  console.log("Usuários de teste: admin/admin123, gerente/gerente123,");
  console.log("garcom/garcom123, cozinheiro/cozinheiro123, cliente/cliente123");
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
