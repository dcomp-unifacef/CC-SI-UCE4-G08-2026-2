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
  imagem = "",
) {
  const existente = await prisma.produto.findFirst({ where: { nome } });

  if (existente) {
    return prisma.produto.update({
      where: { idProduto: existente.idProduto },
      data: { preco, descricao, disponivel, imagem },
    });
  }

  return prisma.produto.create({
    data: { nome, preco, descricao, disponivel, imagem },
  });
}

async function main() {
  const tipoAdministrador = await garantirTipoUsuario("Administrador");
  const tipoGarcom = await garantirTipoUsuario("Garçom");
  const tipoCozinheiro = await garantirTipoUsuario("Cozinheiro");
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

  const cozinheiro = await garantirUsuario(
    process.env.SEED_COZINHEIRO_LOGIN ?? "cozinheiro",
    process.env.SEED_COZINHEIRO_NOME ?? "Cozinheiro Exemplo",
    process.env.SEED_COZINHEIRO_SENHA ?? "cozinheiro123",
    tipoCozinheiro.idTipoUsuario,
  );

  const produtos = [
    {
      nome: "Cachorro-quente",
      preco: 12.5,
      descricao: "Pão, salsicha e molho especial",
      imagem: "/img/HotDog.png",
    },
    {
      nome: "X-Salada",
      preco: 18.9,
      descricao: "Pão, hambúrguer, queijo, alface e tomate",
      imagem: "/img/Lanche.png",
    },
    {
      nome: "Batata frita",
      preco: 9.9,
      descricao: "Porção individual de batata frita",
      imagem: "/img/batatafrita.png",
    },
    {
      nome: "Refrigerante lata",
      preco: 6,
      descricao: "Lata de 350 ml",
      imagem: "/img/RefriLata.png",
    },
    {
      nome: "X-Bacon",
      preco: 24.9,
      descricao: "Hambúrguer, queijo, bacon crocante, alface e tomate",
      imagem: "/img/Lanche.png",
    },
    {
      nome: "Suco natural",
      preco: 6.5,
      descricao: "Suco natural de laranja, 300 ml",
      imagem: "/img/Suco.png",
    },
    {
      nome: "Pudim",
      preco: 6.9,
      descricao: "Pudim de leite condensado com calda de caramelo",
      imagem: "/img/Pudim.png",
    },
  ];

  for (const produto of produtos) {
    await garantirProduto(
      produto.nome,
      produto.preco,
      produto.descricao,
      true,
      produto.imagem,
    );
  }

  console.log(
    `Seed concluído. Admin: ${admin.loginUsuario}, cliente: ${cliente.loginUsuario}, garçom: ${garcom.loginUsuario}, cozinheiro: ${cozinheiro.loginUsuario}.`,
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
