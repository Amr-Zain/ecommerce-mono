import { Module } from '@nestjs/common';
import { ClientOrdersController } from './client-orders.controller';
import { ClientOrdersService } from './client-orders.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientOrdersController],
  providers: [ClientOrdersService],
})
export class ClientOrdersModule {}