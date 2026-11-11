import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { validarCpf, apenasDigitos } from '@common/utils/cpf-validator';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { QueryFuncionarioDto } from './dto/query-funcionario.dto';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { AuditService, AuditLogData } from '@common/services/audit.service';

const SOFT_DELETE_WHERE = { deletedAt: null };

@Injectable()
export class FuncionarioService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly auditService: AuditService,
  ) {}

  private validarCpfOuErro(cpf: string): string {
    const digitos = apenasDigitos(cpf);
    if (!validarCpf(digitos)) {
      throw new ConflictException('CPF inválido');
    }
    return digitos;
  }

  async create(dto: CreateFuncionarioDto) {
    const cpf = this.validarCpfOuErro(dto.cpf);

    const existing = await this.prisma.funcionario.findFirst({
      where: { OR: [{ cpf }, { email: dto.email }], deletedAt: null },
    });

    if (existing) {
      if (existing.cpf === cpf) {
        throw new ConflictException('CPF já cadastrado');
      }
      throw new ConflictException('E-mail já cadastrado');
    }

    const funcionario = await this.prisma.funcionario.create({
      data: {
        nome: dto.nome,
        cpf,
        email: dto.email,
        departamento: dto.departamento,
      },
    });

    await this.auditService.log({
      entityType: 'Funcionario',
      entityId: funcionario.id,
      action: 'CREATE',
      newData: { nome: funcionario.nome, cpf: funcionario.cpf, email: funcionario.email, departamento: funcionario.departamento },
    } as AuditLogData);

    return funcionario;
  }

  async findAll(query: QueryFuncionarioDto): Promise<PaginatedResponseDto<any>> {
    const { page, limit, search, departamento, contratoId } = query;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departamento) {
      where.departamento = departamento;
    }

    if (contratoId) {
      where.contratos = {
        some: { contratoId, contrato: { deletedAt: null } },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.funcionario.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contratos: {
            include: { contrato: true },
          },
        },
      }),
      this.prisma.funcionario.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
      include: {
        contratos: {
          include: { contrato: true },
        },
      },
    });

    if (!funcionario || funcionario.deletedAt) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return funcionario;
  }

  async update(id: string, dto: UpdateFuncionarioDto) {
    const before = await this.findOne(id);

    if (dto.cpf) {
      const cpf = this.validarCpfOuErro(dto.cpf);
      const existing = await this.prisma.funcionario.findFirst({
        where: { cpf, NOT: { id }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
      dto.cpf = cpf;
    }

    if (dto.email) {
      const existing = await this.prisma.funcionario.findFirst({
        where: { email: dto.email, NOT: { id }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    const after = await this.prisma.funcionario.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      entityType: 'Funcionario',
      entityId: id,
      action: 'UPDATE',
      oldData: { nome: before.nome, cpf: before.cpf, email: before.email, departamento: before.departamento },
      newData: { nome: after.nome, cpf: after.cpf, email: after.email, departamento: after.departamento },
    } as AuditLogData);

    return after;
  }

  async remove(id: string) {
    const before = await this.findOne(id);
    await this.prisma.funcionario.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      entityType: 'Funcionario',
      entityId: id,
      action: 'DELETE',
      oldData: { nome: before.nome, cpf: before.cpf, email: before.email, departamento: before.departamento },
    } as AuditLogData);
  }
}