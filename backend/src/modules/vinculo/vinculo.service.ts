import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateVinculoDto } from './dto/update-vinculo.dto';
import { AuditService, AuditLogData } from '@common/services/audit.service';

const SOFT_DELETE_WHERE = { deletedAt: null };

@Injectable()
export class VinculoService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly auditService: AuditService,
  ) {}

  async replaceFuncionarios(contratoId: string, dto: UpdateVinculoDto) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id: contratoId },
    });
    if (!contrato || contrato.deletedAt) {
      throw new NotFoundException('Contrato não encontrado');
    }

    const oldVinculos = await this.prisma.contratoFuncionario.findMany({
      where: { contratoId },
      select: { funcionarioId: true },
    });
    const oldFuncionarioIds = oldVinculos.map((v) => v.funcionarioId);

    if (dto.funcionarioIds.length > 0) {
      const funcionarios = await this.prisma.funcionario.findMany({
        where: { id: { in: dto.funcionarioIds }, deletedAt: null },
      });
      if (funcionarios.length !== dto.funcionarioIds.length) {
        throw new NotFoundException('Um ou mais funcionários não encontrados');
      }
    }

    const uniqueIds = new Set(dto.funcionarioIds);
    if (uniqueIds.size !== dto.funcionarioIds.length) {
      throw new ConflictException('Lista contém funcionários duplicados');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.contratoFuncionario.deleteMany({
        where: { contratoId },
      });

      if (dto.funcionarioIds.length > 0) {
        await tx.contratoFuncionario.createMany({
          data: dto.funcionarioIds.map((funcionarioId) => ({
            contratoId,
            funcionarioId,
          })),
        });
      }

      return tx.contrato.findUnique({
        where: { id: contratoId },
        include: {
          funcionarios: {
            include: { funcionario: true },
          },
          _count: {
            select: { funcionarios: true },
          },
        },
      });
    });

    await this.auditService.log({
      entityType: 'ContratoFuncionario',
      entityId: contratoId,
      action: 'UPDATE',
      oldData: { funcionarioIds: oldFuncionarioIds },
      newData: { funcionarioIds: dto.funcionarioIds },
    } as AuditLogData);

    return result;
  }

  async addFuncionario(contratoId: string, funcionarioId: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id: contratoId },
    });
    if (!contrato || contrato.deletedAt) {
      throw new NotFoundException('Contrato não encontrado');
    }

    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });
    if (!funcionario || funcionario.deletedAt) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const existing = await this.prisma.contratoFuncionario.findUnique({
      where: { contratoId_funcionarioId: { contratoId, funcionarioId } },
    });
    if (existing) {
      throw new ConflictException('Funcionário já vinculado a este contrato');
    }

    const vinculo = await this.prisma.contratoFuncionario.create({
      data: { contratoId, funcionarioId },
      include: { funcionario: true },
    });

    await this.auditService.log({
      entityType: 'ContratoFuncionario',
      entityId: contratoId,
      action: 'CREATE',
      newData: { funcionarioId, funcionarioNome: funcionario.nome },
    } as AuditLogData);

    return vinculo;
  }

  async removeFuncionario(contratoId: string, funcionarioId: string) {
    const existing = await this.prisma.contratoFuncionario.findUnique({
      where: { contratoId_funcionarioId: { contratoId, funcionarioId } },
    });
    if (!existing) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    await this.prisma.contratoFuncionario.delete({
      where: { contratoId_funcionarioId: { contratoId, funcionarioId } },
    });

    await this.auditService.log({
      entityType: 'ContratoFuncionario',
      entityId: contratoId,
      action: 'DELETE',
      oldData: { funcionarioId, funcionarioNome: funcionario?.nome },
    } as AuditLogData);
  }
}