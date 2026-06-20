import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@/prisma';
import { SLIDERS_REPOSITORY, Slider } from '@/common/interfaces';
import { SlidersRepository } from '@/core/sliders/sliders.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class SlidersService {
  constructor(
    @Inject(SLIDERS_REPOSITORY) private readonly repo: SlidersRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async getAllSliders(query: AdvancedQueryDto): Promise<PaginatedResult<Slider> | Slider[]> {
    return this.repo.findAll(query);
  }

  async updateSlider(id: number, slider: UpdateSliderDto): Promise<Slider> {
    const updated = await this.repo.update(id, slider as unknown as Prisma.SliderUpdateInput);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.slidersChanged);
    return updated;
  }

  async deleteSlider(id: number): Promise<Slider> {
    const deleted = await this.repo.delete(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.slidersChanged);
    return deleted;
  }

  async createSlider(slider: CreateSliderDto): Promise<Slider> {
    const created = await this.repo.create(slider as unknown as Prisma.SliderCreateInput);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.slidersChanged);
    return created;
  }

  async getSliderById(id: number | bigint): Promise<Slider> {
    return this.repo.findByIdOrThrow(id);
  }

  async getSliderByIdWithAllTranslations(id: number | bigint): Promise<Slider> {
    return this.repo.findByIdOrThrow(id, { include: { translations: true } });
  }
}
