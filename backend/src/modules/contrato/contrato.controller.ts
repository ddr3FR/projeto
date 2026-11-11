import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContratoService } from './contrato.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { QueryContratoDto } from './dto/query-contrato.dto';

@ApiTags('Contratos')
@Controller('api/contratos')
export class ContratoController {
  constructor(private readonly service: ContratoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar contrato' })
  @ApiResponse({ status: 201, description: 'Contrato criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Nome duplicado' })
  create(@Body() dto: CreateContratoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contratos (paginado, com contagem de funcionários)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de contratos' })
  findAll(@Query() query: QueryContratoDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar contrato por ID (com funcionários vinculados)' })
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  @ApiResponse({ status: 200, description: 'Contrato atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  @ApiResponse({ status: 409, description: 'Nome duplicado' })
  update(@Param('id') id: string, @Body() dto: UpdateContratoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir contrato' })
  @ApiResponse({ status: 204, description: 'Contrato excluído' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}