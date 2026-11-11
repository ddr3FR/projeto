import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsIn } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateFuncionarioDto } from './create-funcionario.dto';
import { departamentosValidos } from '../entities/funcionario.entity';

export class UpdateFuncionarioDto extends PartialType(CreateFuncionarioDto) {
  @ApiProperty({ required: false, example: 'João Silva' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome?: string;

  @ApiProperty({ required: false, example: '12345678901' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({ required: false, example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: 'Engenharia Civil', enum: departamentosValidos })
  @IsOptional()
  @IsString()
  @IsIn(departamentosValidos)
  departamento?: string;
}