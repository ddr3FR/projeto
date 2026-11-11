export const departamentosValidos = [
  'Engenharia Civil',
  'Elétrica',
  'Mecânica',
  'Segurança do Trabalho',
  'Administrativo',
] as const;

export type Departamento = (typeof departamentosValidos)[number];

export class FuncionarioEntity {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  departamento: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FuncionarioEntity>) {
    Object.assign(this, partial);
  }
}

export class FuncionarioWithRelationsEntity extends FuncionarioEntity {
  contratos?: Array<{
    contratoId: string;
    vinculadoEm: Date;
    contrato?: {
      id: string;
      nome: string;
      status: string;
    };
  }>;
}