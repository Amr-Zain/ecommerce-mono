import { Module } from '@nestjs/common';
import { ClientAddressesController } from './client-addresses.controller';
import { ClientAddressesService } from './client-addresses.service';
import { ClientAddressesRepository } from './client-addresses.repository';
import { CLIENT_ADDRESSES_REPOSITORY } from './client-addresses.repository.port';

@Module({
  controllers: [ClientAddressesController],
  providers: [ClientAddressesService, { provide: CLIENT_ADDRESSES_REPOSITORY, useClass: ClientAddressesRepository }],
})
export class ClientAddressesModule {}
