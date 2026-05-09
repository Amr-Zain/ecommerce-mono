import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import CountriesService from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryQueryDto } from './dto/country-query.dto';
import { ParsedQuery } from '../../common/decorators/parsed-query.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@Controller('admin/countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @RequirePermissions({ resource: 'countries', action: 'create' })
  async create(@Body() createCountryDto: CreateCountryDto) {
    const country = await this.countriesService.createCountry(createCountryDto);
    return {
      success: true,
      data: country,
    };
  }

  @Get()
  @RequirePermissions({ resource: 'countries', action: 'list' })
  async findAll(@ParsedQuery(CountryQueryDto) query: CountryQueryDto) {
    const result = await this.countriesService.getAllCountries(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @RequirePermissions({ resource: 'countries', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const country = await this.countriesService.getCountryById(BigInt(id));
    return {
      success: true,
      data: country,
    };
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'countries', action: 'update' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCountryDto: UpdateCountryDto) {
    const country = await this.countriesService.updateCountry(id, updateCountryDto);
    return {
      success: true,
      data: country,
    };
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'countries', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const country = await this.countriesService.deleteCountry(BigInt(id));
    return {
      success: true,
      data: country,
      message: 'Country deleted successfully',
    };
  }
}
