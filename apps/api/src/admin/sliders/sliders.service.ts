import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@/prisma';
import { SLIDERS_REPOSITORY, Slider } from '@/common/interfaces';
import { SlidersRepository } from '@/core/sliders/sliders.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';

@Injectable()
export class SlidersService {
  constructor(@Inject(SLIDERS_REPOSITORY) private readonly repo: SlidersRepository) {}

  async getAllSliders(query: AdvancedQueryDto): Promise<PaginatedResult<Slider> | Slider[]> {
    return this.repo.findAll(query);
  }

  async updateSlider(id: number, slider: UpdateSliderDto): Promise<Slider> {
    return this.repo.update(id, slider as unknown as Prisma.SliderUpdateInput);
  }

  async deleteSlider(id: number): Promise<Slider> {
    return this.repo.delete(id);
  }

  async createSlider(slider: CreateSliderDto): Promise<Slider> {
    return this.repo.create(slider as unknown as Prisma.SliderCreateInput);
  }

  async getSliderById(id: number | bigint): Promise<Slider | null> {
    return this.repo.findById(id);
  }

  async getSliderByIdWithAllTranslations(id: number | bigint): Promise<Slider | null> {
    return this.repo.findByIdWithAllTranslations(id);
  }
}
