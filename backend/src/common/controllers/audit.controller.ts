import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';

@ApiTags('Auditoria')
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoria' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filtrar por tipo de entidade' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filtrar por ID da entidade' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados (padrão: 50)' })
  async getLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getLogs(entityType, entityId, limit ? parseInt(limit, 10) : 50);
  }
}