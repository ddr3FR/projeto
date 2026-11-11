import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateVinculoDto {
  @ApiProperty({ type: [String], example: ['uuid-func-1', 'uuid-func-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  funcionarioIds: string[];
}