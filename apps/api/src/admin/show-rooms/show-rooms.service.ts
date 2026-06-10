import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@/prisma';
import { SHOW_ROOMS_REPOSITORY, ShowRoom } from '@/common/interfaces';
import { ShowRoomsRepository } from '@/core/show-rooms/show-rooms.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateShowRoomDto } from './dto/create-show-room.dto';
import { UpdateShowRoomDto } from './dto/update-show-room.dto';

@Injectable()
export class ShowRoomsService {
  constructor(@Inject(SHOW_ROOMS_REPOSITORY) private readonly repo: ShowRoomsRepository) { }

  async getAllShowRooms(query: AdvancedQueryDto, locale?: string): Promise<PaginatedResult<ShowRoom> | ShowRoom[]> {
    return this.repo.findAll(query, locale, { include: { country: true }});
  }

  async createShowRoom(showRoom: CreateShowRoomDto): Promise<ShowRoom> {
    return this.repo.create(showRoom as unknown as Prisma.ShowRoomCreateInput);
  }

  async updateShowRoom(id: number, showRoom: UpdateShowRoomDto): Promise<ShowRoom> {
    return this.repo.update(id, showRoom as unknown as Prisma.ShowRoomUpdateInput);
  }

  async deleteShowRoom(id: number): Promise<ShowRoom> {
    return this.repo.delete(id);
  }

  async getShowRoomById(id: number | bigint): Promise<ShowRoom> {
    return this.repo.findByIdOrThrow(id);
  }

  async getShowRoomByIdWithAllTranslations(id: number | bigint): Promise<ShowRoom> {
    return this.repo.findByIdOrThrow(id, {
      include: { country: { include: { translations: true } }, translations: true },
    });
  }
}
