import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsController } from './supervisors.controller';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [SupervisorsController, ClientsController],
  providers: [SupervisorsService, ClientsService, UsersRepository],
  exports: [SupervisorsService, ClientsService, UsersRepository],
})
export class UsersModule {}
