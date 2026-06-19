import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ParseBigIntPipe } from '@/common/pipes/parse-bigint.pipe';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { MessageService } from './message.service';
import { CreateMessageTemplateDto, PreviewMessageTemplateDto, UpdateMessageTemplateDto } from './dto/message-template.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Shared - Message')
@ApiBearerAuth('access-token')
@Controller('message-templates')
export class MessageTemplateController {
  constructor(private readonly messages: MessageService) {}

  @Get()
  @RequirePermissions({ resource: 'message_templates', action: 'list' })
  @ApiQuery({ name: 'search', required: false, example: 'welcome' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  list(@Query() query: Record<string, unknown>) {
    return this.messages.listTemplates(query);
  }

  @Post()
  @RequirePermissions({ resource: 'message_templates', action: 'create' })
  create(@Body() dto: CreateMessageTemplateDto) {
    return this.messages.createTemplate(dto);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'message_templates', action: 'read' })
  get(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.messages.getTemplate(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'message_templates', action: 'update' })
  update(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdateMessageTemplateDto) {
    return this.messages.updateTemplate(id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'message_templates', action: 'delete' })
  delete(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.messages.deleteTemplate(id);
  }

  @Post(':id/preview')
  @RequirePermissions({ resource: 'message_templates', action: 'read' })
  preview(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: PreviewMessageTemplateDto) {
    return this.messages.previewTemplate(id, dto);
  }
}

@Controller('messages')
export class MessageCampaignController {
  constructor(private readonly messages: MessageService) {}

  @Post('send')
  @RequirePermissions({ resource: 'messages', action: 'create' })
  send(@CurrentUser() user: { id: bigint | number | string }, @Body() dto: SendMessageDto) {
    return this.messages.send(dto, BigInt(user.id));
  }

  @Get()
  @RequirePermissions({ resource: 'messages', action: 'list' })
  list() {
    return this.messages.listCampaigns();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'messages', action: 'read' })
  get(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.messages.getCampaign(id);
  }
}
