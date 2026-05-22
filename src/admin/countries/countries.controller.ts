import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryQueryDto } from './dto/country-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';

@ApiContext('admin')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @RequirePermissions({ resource: 'countries', action: 'create' })
  @UseLanguageTransform()
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.createCountry(createCountryDto);
  }

  @Get()
  @RequirePermissions({ resource: 'countries', action: 'list' })
  async findAll(@ParsedQuery(CountryQueryDto) query: CountryQueryDto) {
    return this.countriesService.getAllCountries(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'countries', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.countriesService.getCountryById(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'countries', action: 'update' })
  @UseLanguageTransform()
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCountryDto: UpdateCountryDto) {
    return await this.countriesService.updateCountry(id, updateCountryDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'countries', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const country = await this.countriesService.deleteCountry(id);
    return {
      data: country,
      message: 'Country deleted successfully',
    };
  }
}
