import { Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { BodyTransformLanguageKeys } from '@/common/decorators/transform-language-keys.decorator';
import { createCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityQueryDto } from './dto/city-query';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';

@Controller('cities')
export class CitiesController {
  constructor(private readonly cityService: CitiesService) {}

  @Post()
  @RequirePermissions({ resource: 'city', action: 'create' })
  create(@BodyTransformLanguageKeys() createCityDto: createCityDto) {
    return this.cityService.createCity(createCityDto);
  }

  @Get()
  @RequirePermissions({ resource: 'city', action: 'read' })
  findAll(@ParsedQuery(CityQueryDto) query: CityQueryDto) {
    return this.cityService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'city', action: 'read' })
  findOne(@Param('id') id: string, @Query('langId') langId?: string) {
    return this.cityService.findOne(+id, langId);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'city', action: 'update' })
  update(@Param('id') id: string, @BodyTransformLanguageKeys() updateCityDto: UpdateCityDto) {
    return this.cityService.updateCity(+id, updateCityDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'city', action: 'delete' })
  delete(@Param('id') id: string) {
    return this.cityService.deleteCity(+id);
  }
}
