import { Module } from '@nestjs/common';
import { VinculoController } from './vinculo.controller';
import { VinculoService } from './vinculo.service';

@Module({
  controllers: [VinculoController],
  providers: [VinculoService],
  exports: [VinculoService],
})
export class VinculoModule {}