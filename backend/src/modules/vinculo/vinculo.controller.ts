import {
  Controller,
  Put,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VinculoService } from './vinculo.service';
import { UpdateVinculoDto } from './dto/update-vinculo.dto';

@ApiTags('Vínculos')
@Controller('api/contratos/:id/funcionarios')
export class VinculoController {
  constructor(private readonly service: VinculoService) {}

  @Put()
  @ApiOperation({ summary: 'Substituir lista de funcionários do contrato' })
  @ApiResponse({ status: 200, description: 'Lista atualizada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Contrato ou funcionário não encontrado' })
  @ApiResponse({ status: 409, description: 'Funcionários duplicados na lista' })
  replace(@Param('id') contratoId: string, @Body() dto: UpdateVinculoDto) {
    return this.service.replaceFuncionarios(contratoId, dto);
  }

  @Post(':funcionarioId')
  @ApiOperation({ summary: 'Adicionar funcionário ao contrato' })
  @ApiResponse({ status: 201, description: 'Vínculo criado' })
  @ApiResponse({ status: 404, description: 'Contrato ou funcionário não encontrado' })
  @ApiResponse({ status: 409, description: 'Funcionário já vinculado' })
  add(@Param('id') contratoId: string, @Param('funcionarioId') funcionarioId: string) {
    return this.service.addFuncionario(contratoId, funcionarioId);
  }

  @Delete(':funcionarioId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover funcionário do contrato' })
  @ApiResponse({ status: 204, description: 'Vínculo removido' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  remove(@Param('id') contratoId: string, @Param('funcionarioId') funcionarioId: string) {
    return this.service.removeFuncionario(contratoId, funcionarioId);
  }
}