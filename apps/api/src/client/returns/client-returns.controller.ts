import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientReturnsService } from './client-returns.service';
import { CreateExchangeRequestDto, CreateReturnRequestDto } from './dto/client-return-exchange.dto';

@ApiContext('client')
@Controller()
export class ClientReturnsController {
  constructor(private readonly returnsService: ClientReturnsService) {}

  @Get('returns')
  findReturns(@CurrentUser() user: { id: bigint }) {
    return this.returnsService.findReturns(user.id);
  }

  @Post('returns')
  createReturn(@CurrentUser() user: { id: bigint }, @Body() dto: CreateReturnRequestDto) {
    return this.returnsService.createReturn(user.id, dto);
  }

  @Post('returns/:id/cancel')
  cancelReturn(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.returnsService.cancelReturn(user.id, BigInt(id));
  }

  @Get('exchanges')
  findExchanges(@CurrentUser() user: { id: bigint }) {
    return this.returnsService.findExchanges(user.id);
  }

  @Post('exchanges')
  createExchange(@CurrentUser() user: { id: bigint }, @Body() dto: CreateExchangeRequestDto) {
    return this.returnsService.createExchange(user.id, dto);
  }

  @Post('exchanges/:id/cancel')
  cancelExchange(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.returnsService.cancelExchange(user.id, BigInt(id));
  }
}
