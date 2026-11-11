import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateContratoDto } from './create-contrato.dto';

export class UpdateContratoDto extends PartialType(CreateContratoDto) {
  @ApiProperty({ required: false, example: 'Construção do Edifício Alpha' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nome?: string;

  @ApiProperty({ required: false, example: 'Descrição do contrato...' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false, enum: ['ATIVO', 'ENCERRADO', 'SUSPENSO'] })
  @IsOptional()
  @IsString()
  status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO';
}