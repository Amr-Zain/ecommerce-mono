import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UNIT_OF_WORK } from '@/common/persistence';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

@Global()
@Module({
  providers: [PrismaService, PrismaUnitOfWork, { provide: UNIT_OF_WORK, useExisting: PrismaUnitOfWork }],
  exports: [PrismaService, UNIT_OF_WORK],
})
export class PrismaModule {}
