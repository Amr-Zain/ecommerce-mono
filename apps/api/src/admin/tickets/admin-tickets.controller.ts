import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { AuthUserPayload } from '@/auth/auth.service';
import { ReplyTicketDto, UpdateTicketDto } from '@/core/tickets/dto/ticket.dto';
import { TicketsService } from '@/core/tickets/tickets.service';

@ApiContext('admin')
@Controller('tickets')
export class AdminTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @RequirePermissions({ resource: 'tickets', action: 'list' })
  findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.ticketsService.findAdminTickets(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'tickets', action: 'read' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findAdminTicket(BigInt(id));
  }

  @Get(':id/messages')
  @RequirePermissions({ resource: 'tickets', action: 'read' })
  findMessages(@Param('id') id: string, @ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.ticketsService.findAdminMessages(BigInt(id), query);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'tickets', action: 'update' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.updateAdminTicket(BigInt(id), dto);
  }

  @Post(':id/replies')
  @RequirePermissions({ resource: 'tickets', action: 'update' })
  reply(@CurrentUser() user: AuthUserPayload, @Param('id') id: string, @Body() dto: ReplyTicketDto) {
    return this.ticketsService.createAdminReply(user.id, BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'tickets', action: 'delete' })
  remove(@Param('id') id: string) {
    return this.ticketsService.deleteAdminTicket(BigInt(id));
  }
}
