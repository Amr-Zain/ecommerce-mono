import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma';
import { CitiesRepository } from './cities.repository';
import { CityQueryDto } from './dto/city-query';
import { createCityDto } from './dto/create-city.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
import { City as CityModel } from '@prisma/client';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(private readonly CitiesRepo: CitiesRepository) {}

  createCity(city: createCityDto) {
    return this.CitiesRepo.createCity(city as unknown as Prisma.CityCreateInput);
  }

  updateCity(id: number | bigint, city: UpdateCityDto) {
    return this.CitiesRepo.updateCity(id, city as unknown as Prisma.CityUpdateInput);
  }

  async findAll(query: CityQueryDto): Promise<PaginatedResult<CityModel> | CityModel[]> {
    return this.CitiesRepo.findAll(query);
  }

  async findOne(id: number | bigint, langId?: string): Promise<CityModel | null> {
    return this.CitiesRepo.findByIdWithRelations(id, langId);
  }

  deleteCity(id: number | bigint) {
    return this.CitiesRepo.deleteCity(id);
  }
}
