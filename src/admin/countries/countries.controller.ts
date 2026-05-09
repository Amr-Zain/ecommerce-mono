import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import CountriesService from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryQueryDto } from './dto/country-query.dto';
import { ParsedQuery } from '../../common/decorators/parsed-query.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @RequirePermissions({ resource: 'countries', action: 'create' })
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.createCountry(createCountryDto);
  }

  @Get()
  @RequirePermissions({ resource: 'countries', action: 'list' })
  async findAll(@ParsedQuery(CountryQueryDto) query: CountryQueryDto) {
    const result = await this.countriesService.getAllCountries(query);
    return {
      items: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions({ resource: 'countries', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.getCountryById(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'countries', action: 'update' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.updateCountry(id, updateCountryDto);
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
