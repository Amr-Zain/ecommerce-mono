import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { CreateTicketDto, ReplyTicketDto } from '@/core/tickets/dto/ticket.dto';
import { TicketsService } from '@/core/tickets/tickets.service';

@ApiContext('client')
@Controller('tickets')
export class ClientTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: bigint }) {
    return this.ticketsService.findClientTickets(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: bigint }, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createClientTicket(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.ticketsService.findClientTicket(user.id, BigInt(id));
  }

  @Get(':id/messages')
  findMessages(
    @CurrentUser() user: { id: bigint },
    @Param('id') id: string,
    @ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto,
  ) {
    return this.ticketsService.findClientMessages(user.id, BigInt(id), query);
  }

  @Post(':id/replies')
  reply(@CurrentUser() user: { id: bigint }, @Param('id') id: string, @Body() dto: ReplyTicketDto) {
    return this.ticketsService.createClientReply(user.id, BigInt(id), dto);
  }
}
