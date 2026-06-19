import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { ShowRoomsService } from './show-rooms.service';
import { CreateShowRoomDto } from './dto/create-show-room.dto';
import { UpdateShowRoomDto } from './dto/update-show-room.dto';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Show-rooms')
@ApiBearerAuth('access-token')
@Controller('show-rooms')
export class ShowRoomsController {
  constructor(private readonly showRoomsService: ShowRoomsService) {}

  @Post()
  @RequirePermissions({ resource: 'show-rooms', action: 'create' })
  @UseLanguageTransform()
  async create(@Body() createShowRoomDto: CreateShowRoomDto) {
    return this.showRoomsService.createShowRoom(createShowRoomDto);
  }

  @Get()
  @RequirePermissions({ resource: 'show-rooms', action: 'list' })
  @ApiAdvancedQuery()
  async findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.showRoomsService.getAllShowRooms(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'show-rooms', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.showRoomsService.getShowRoomByIdWithAllTranslations(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'show-rooms', action: 'update' })
  @UseLanguageTransform()
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateShowRoomDto: UpdateShowRoomDto) {
    return await this.showRoomsService.updateShowRoom(id, updateShowRoomDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'show-rooms', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const showRoom = await this.showRoomsService.deleteShowRoom(id);
    return {
      data: showRoom,
      message: 'Show room deleted successfully',
    };
  }
}
