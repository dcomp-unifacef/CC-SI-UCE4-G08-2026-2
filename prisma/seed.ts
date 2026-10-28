import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("A variável DATABASE_URL não foi definida.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function garantirTipoUsuario(nome: string) {
  const existente = await prisma.tipoUsuario.findFirst({ where: { nome } });

  if (existente) {
    return existente;
  }

  return prisma.tipoUsuario.create({ data: { nome } });
}

async function garantirUsuario(
  loginUsuario: string,
  nome: string,
  senha: string,
  idTipoUsuario: number,
) {
  return prisma.usuario.upsert({
    where: { loginUsuario },
    update: {
      nome,
      idTipoUsuario,
      statusUsuario: true,
    },
    create: {
      nome,
      loginUsuario,
      senha: await hash(senha, 8),
      statusUsuario: true,
      idTipoUsuario,
    },
  });
}

async function garantirProduto(
  nome: string,
  preco: number,
  descricao: string,
  disponivel = true,
) {
  const existente = await prisma.produto.findFirst({ where: { nome } });

  if (existente) {
    return existente;
  }

  return prisma.produto.create({
    data: { nome, preco, descricao, disponivel },
  });
}

async function main() {
  const tipoAdministrador = await garantirTipoUsuario("Administrador");
  const tipoGarcom = await garantirTipoUsuario("Garçom");
  const tipoCliente = await garantirTipoUsuario("Cliente");

  const admin = await garantirUsuario(
    process.env.SEED_ADMIN_LOGIN ?? "admin",
    process.env.SEED_ADMIN_NOME ?? "Administrador",
    process.env.SEED_ADMIN_SENHA ?? "admin123",
    tipoAdministrador.idTipoUsuario,
  );

  const cliente = await garantirUsuario(
    process.env.SEED_CLIENTE_LOGIN ?? "cliente",
    process.env.SEED_CLIENTE_NOME ?? "Cliente Exemplo",
    process.env.SEED_CLIENTE_SENHA ?? "cliente123",
    tipoCliente.idTipoUsuario,
  );

  const garcom = await garantirUsuario(
    process.env.SEED_GARCOM_LOGIN ?? "garcom",
    process.env.SEED_GARCOM_NOME ?? "Garçom Exemplo",
    process.env.SEED_GARCOM_SENHA ?? "garcom123",
    tipoGarcom.idTipoUsuario,
  );

  const produtos = [
    {
      nome: "Cachorro-quente",
      preco: 12.5,
      descricao: "Pão, salsicha e molho especial",
    },
    {
      nome: "X-Salada",
      preco: 18.9,
      descricao: "Pão, hambúrguer, queijo, alface e tomate",
    },
    {
      nome: "Batata frita",
      preco: 9.9,
      descricao: "Porção individual de batata frita",
    },
    {
      nome: "Refrigerante lata",
      preco: 6,
      descricao: "Lata de 350 ml",
    },
  ];

  for (const produto of produtos) {
    await garantirProduto(
      produto.nome,
      produto.preco,
      produto.descricao,
    );
  }

  console.log(
    `Seed concluído. Admin: ${admin.loginUsuario}, cliente: ${cliente.loginUsuario}, garçom: ${garcom.loginUsuario}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
