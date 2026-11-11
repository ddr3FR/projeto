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
import { FuncionarioService } from './funcionario.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { QueryFuncionarioDto } from './dto/query-funcionario.dto';

@ApiTags('Funcionários')
@Controller('api/funcionarios')
export class FuncionarioController {
  constructor(private readonly service: FuncionarioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar funcionário' })
  @ApiResponse({ status: 201, description: 'Funcionário criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail duplicado' })
  create(@Body() dto: CreateFuncionarioDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar funcionários (paginado, com filtros)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de funcionários' })
  findAll(@Query() query: QueryFuncionarioDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail duplicado' })
  update(@Param('id') id: string, @Body() dto: UpdateFuncionarioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir funcionário' })
  @ApiResponse({ status: 204, description: 'Funcionário excluído' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}