import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@/prisma';
import { SHOW_ROOMS_REPOSITORY, ShowRoom } from '@/common/interfaces';
import { ShowRoomsRepository } from '@/core/show-rooms/show-rooms.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateShowRoomDto } from './dto/create-show-room.dto';
import { UpdateShowRoomDto } from './dto/update-show-room.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class ShowRoomsService {
  constructor(
    @Inject(SHOW_ROOMS_REPOSITORY) private readonly repo: ShowRoomsRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async getAllShowRooms(query: AdvancedQueryDto, locale?: string): Promise<PaginatedResult<ShowRoom> | ShowRoom[]> {
    return this.repo.findAll(query, locale);
  }

  async createShowRoom(showRoom: CreateShowRoomDto): Promise<ShowRoom> {
    const created = await this.repo.create(showRoom as unknown as Prisma.ShowRoomCreateInput);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.showRoomsChanged);
    return created;
  }

  async updateShowRoom(id: number, showRoom: UpdateShowRoomDto): Promise<ShowRoom> {
    const updated = await this.repo.update(id, showRoom as unknown as Prisma.ShowRoomUpdateInput);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.showRoomsChanged);
    return updated;
  }

  async deleteShowRoom(id: number): Promise<ShowRoom> {
    const deleted = await this.repo.delete(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.showRoomsChanged);
    return deleted;
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
