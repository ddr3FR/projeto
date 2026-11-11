import { Injectable, Inject } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

export interface AuditLogData {
  entityType: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  oldData?: Record<string, any>
  newData?: Record<string, any>
  userIp?: string
  userAgent?: string
}

@Injectable()
export class AuditService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: data.entityType,
          entityId: data.entityId,
          action: data.action,
          oldData: data.oldData as Prisma.InputJsonValue | undefined,
          newData: data.newData as Prisma.InputJsonValue | undefined,
          userIp: data.userIp ?? null,
          userAgent: data.userAgent ?? null,
        },
      })
    } catch (error) {
      console.error('[AuditService] Failed to write audit log:', error)
    }
  }

  async getLogs(entityType?: string, entityId?: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}