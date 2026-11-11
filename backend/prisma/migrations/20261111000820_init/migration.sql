-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('ATIVO', 'ENCERRADO', 'SUSPENSO');

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusContrato" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_funcionarios" (
    "contratoId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "vinculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrato_funcionarios_pkey" PRIMARY KEY ("contratoId","funcionarioId")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");

-- AddForeignKey
ALTER TABLE "contrato_funcionarios" ADD CONSTRAINT "contrato_funcionarios_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_funcionarios" ADD CONSTRAINT "contrato_funcionarios_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
