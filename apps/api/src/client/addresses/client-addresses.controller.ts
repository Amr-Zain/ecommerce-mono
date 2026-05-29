import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientAddressesService } from './client-addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiContext('client')
@Controller('profile/addresses')
export class ClientAddressesController {
  constructor(private readonly addressesService: ClientAddressesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: bigint }) {
    return this.addressesService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: bigint }, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressesService.remove(BigInt(id));
  }

  @Put(':id/default')
  setDefault(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.addressesService.setDefault(user.id, BigInt(id));
  }
}