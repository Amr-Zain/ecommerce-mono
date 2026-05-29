import { Module } from '@nestjs/common';
import { ClientAddressesController } from './client-addresses.controller';
import { ClientAddressesService } from './client-addresses.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientAddressesController],
  providers: [ClientAddressesService],
})
export class ClientAddressesModule {}