import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateContratoDto {
  @ApiProperty({ example: 'Construção do Edifício Alpha' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nome: string;

  @ApiProperty({ required: false, example: 'Descrição do contrato...' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false, enum: ['ATIVO', 'ENCERRADO', 'SUSPENSO'], default: 'ATIVO' })
  @IsOptional()
  @IsString()
  status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO';
}