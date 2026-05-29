import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';

@ApiContext('admin')
@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Post()
  @RequirePermissions({ resource: 'sliders', action: 'create' })
  @UseLanguageTransform()
  async create(@Body() createSliderDto: CreateSliderDto) {
    return this.slidersService.createSlider(createSliderDto);
  }

  @Get()
  @RequirePermissions({ resource: 'sliders', action: 'list' })
  async findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.slidersService.getAllSliders(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'sliders', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.slidersService.getSliderByIdWithAllTranslations(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'sliders', action: 'update' })
  @UseLanguageTransform()
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSliderDto: UpdateSliderDto) {
    return await this.slidersService.updateSlider(id, updateSliderDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'sliders', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const slider = await this.slidersService.deleteSlider(id);
    return {
      data: slider,
      message: 'Slider deleted successfully',
    };
  }
}
