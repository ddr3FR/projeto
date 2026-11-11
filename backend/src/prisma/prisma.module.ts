import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA_CLIENT',
      useFactory: () => {
        const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        });
        return new PrismaClient({ adapter });
      },
    },
  ],
  exports: ['PRISMA_CLIENT'],
})
export class PrismaModule {}