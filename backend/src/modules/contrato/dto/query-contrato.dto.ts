import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto';

export class QueryContratoDto extends PaginationDto {
  @ApiProperty({ required: false, example: 'construção' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: ['ATIVO', 'ENCERRADO', 'SUSPENSO'] })
  @IsOptional()
  @IsEnum(['ATIVO', 'ENCERRADO', 'SUSPENSO'])
  status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO';
}