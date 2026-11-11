export type StatusContrato = 'ATIVO' | 'ENCERRADO' | 'SUSPENSO';

export const statusContratoValidos: StatusContrato[] = ['ATIVO', 'ENCERRADO', 'SUSPENSO'];

export class ContratoEntity {
  id: string;
  nome: string;
  descricao: string;
  status: StatusContrato;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ContratoEntity>) {
    Object.assign(this, partial);
  }
}

export class ContratoWithCountEntity extends ContratoEntity {
  _count?: {
    funcionarios: number;
  };
  funcionarios?: Array<{
    funcionarioId: string;
    vinculadoEm: Date;
    funcionario?: {
      id: string;
      nome: string;
      cpf: string;
      email: string;
      departamento: string;
    };
  }>;
}