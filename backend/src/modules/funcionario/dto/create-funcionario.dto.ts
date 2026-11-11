import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { IsIn } from 'class-validator';
import { departamentosValidos } from '../entities/funcionario.entity';

export class CreateFuncionarioDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Engenharia Civil', enum: departamentosValidos })
  @IsString()
  @IsNotEmpty()
  @IsIn(departamentosValidos)
  departamento: string;
}