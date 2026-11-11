import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';
import { departamentosValidos } from '../entities/funcionario.entity';

export class QueryFuncionarioDto extends PaginationDto {
  @ApiProperty({ required: false, example: 'João' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: departamentosValidos })
  @IsOptional()
  @IsEnum(departamentosValidos)
  departamento?: string;

  @ApiProperty({ required: false, example: 'uuid-do-contrato' })
  @IsOptional()
  @IsString()
  contratoId?: string;
}