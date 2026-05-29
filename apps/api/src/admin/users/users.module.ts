import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsController } from './supervisors.controller';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { UsersModule as CoreUsersModule } from '@/core/users/users.module';

@Module({
  imports: [CoreUsersModule],
  controllers: [SupervisorsController, ClientsController],
  providers: [SupervisorsService, ClientsService],
  exports: [SupervisorsService, ClientsService],
})
export class UsersModule {}
