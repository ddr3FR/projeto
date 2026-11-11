import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { QueryContratoDto } from './dto/query-contrato.dto';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { AuditService, AuditLogData } from '@common/services/audit.service';

const SOFT_DELETE_WHERE = { deletedAt: null };

@Injectable()
export class ContratoService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateContratoDto) {
    const existing = await this.prisma.contrato.findFirst({
      where: { nome: dto.nome, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Já existe um contrato com este nome');
    }

    const contrato = await this.prisma.contrato.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? '',
        status: dto.status ?? 'ATIVO',
      },
    });

    await this.auditService.log({
      entityType: 'Contrato',
      entityId: contrato.id,
      action: 'CREATE',
      newData: { nome: contrato.nome, descricao: contrato.descricao, status: contrato.status },
    } as AuditLogData);

    return contrato;
  }

  async findAll(query: QueryContratoDto): Promise<PaginatedResponseDto<any>> {
    const { page, limit, search, status } = query;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.contrato.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { funcionarios: true },
          },
        },
      }),
      this.prisma.contrato.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        funcionarios: {
          include: { funcionario: true },
        },
        _count: {
          select: { funcionarios: true },
        },
      },
    });

    if (!contrato || contrato.deletedAt) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contrato;
  }

  async update(id: string, dto: UpdateContratoDto) {
    const before = await this.findOne(id);

    if (dto.nome) {
      const existing = await this.prisma.contrato.findFirst({
        where: { nome: dto.nome, NOT: { id }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('Já existe um contrato com este nome');
      }
    }

    const after = await this.prisma.contrato.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      entityType: 'Contrato',
      entityId: id,
      action: 'UPDATE',
      oldData: { nome: before.nome, descricao: before.descricao, status: before.status },
      newData: { nome: after.nome, descricao: after.descricao, status: after.status },
    } as AuditLogData);

    return after;
  }

  async remove(id: string) {
    const before = await this.findOne(id);
    await this.prisma.contrato.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      entityType: 'Contrato',
      entityId: id,
      action: 'DELETE',
      oldData: { nome: before.nome, descricao: before.descricao, status: before.status },
    } as AuditLogData);
  }
}