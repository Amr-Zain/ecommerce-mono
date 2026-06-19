import { Controller, Get, Param, Patch, Query, Sse } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParseBigIntPipe } from '@/common/pipes/parse-bigint.pipe';
import { NotificationService } from './notification.service';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

abstract class BaseNotificationController {
  constructor(protected readonly notifications: NotificationService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiQuery({ name: 'unread', required: false, example: 'false' })
  findAll(
    @CurrentUser() user: { id: bigint },
    @I18nLang() lang: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('unread') unread = 'false',
  ) {
    return this.notifications.findAll(
      user.id,
      Math.max(1, Number(page)),
      Math.min(100, Math.max(1, Number(limit))),
      unread === 'true',
      lang,
    );
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: { id: bigint }) {
    return this.notifications.unreadCount(user.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { id: bigint }) {
    return this.notifications.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: { id: bigint }, @Param('id', ParseBigIntPipe) id: bigint) {
    return this.notifications.markRead(user.id, id);
  }

  @Sse('stream')
  stream(@CurrentUser() user: { id: bigint }, @I18nLang() lang: string) {
    return this.notifications.stream(user.id, lang);
  }
}

@ApiContext('client')
@ApiTags('Shared - Notification')
@ApiBearerAuth('access-token')
@Controller('client/notifications')
export class ClientNotificationController extends BaseNotificationController {
  constructor(notifications: NotificationService) {
    super(notifications);
  }
}

@ApiContext('admin')
@Controller('admin/notifications')
export class AdminNotificationController extends BaseNotificationController {
  constructor(notifications: NotificationService) {
    super(notifications);
  }
}
