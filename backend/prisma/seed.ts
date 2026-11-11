import { PrismaClient, StatusContrato } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.contratoFuncionario.deleteMany();
  await prisma.funcionario.deleteMany();
  await prisma.contrato.deleteMany();

  console.log('Iniciando seed...');

  const f1 = await prisma.funcionario.create({
    data: {
      nome: 'Arthur Dent',
      cpf: '12345678901',
      email: 'arthur@galaxy.com',
      departamento: 'Engenharia Civil',
    },
  });

  const f2 = await prisma.funcionario.create({
    data: {
      nome: 'Ford Prefect',
      cpf: '98765432100',
      email: 'ford@guide.com',
      departamento: 'Segurança do Trabalho',
    },
  });

  const f3 = await prisma.funcionario.create({
    data: {
      nome: 'Tricia McMillan',
      cpf: '11122233344',
      email: 'trillian@earth.com',
      departamento: 'Administrativo',
    },
  });

  const c1 = await prisma.contrato.create({
    data: {
      nome: 'Construção da Via Expressa Hyperspacial',
      descricao: 'Projeto de demolição e construção de via galáctica.',
      status: StatusContrato.ATIVO,
    },
  });

  const c2 = await prisma.contrato.create({
    data: {
      nome: 'Reforma do Coração de Ouro',
      descricao: 'Manutenção preventiva no gerador de improbabilidade infinita.',
      status: StatusContrato.SUSPENSO,
    },
  });

  await prisma.contratoFuncionario.create({
    data: {
      contratoId: c1.id,
      funcionarioId: f1.id,
    },
  });

  await prisma.contratoFuncionario.create({
    data: {
      contratoId: c1.id,
      funcionarioId: f2.id,
    },
  });

  await prisma.contratoFuncionario.create({
    data: {
      contratoId: c2.id,
      funcionarioId: f3.id,
    },
  });

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });