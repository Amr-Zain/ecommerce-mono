import { Injectable } from "@nestjs/common";
import { Prisma } from '../../prisma';
import { CountriesRepository } from "./countries.repository";
import { AdvancedQueryDto } from "src/common/dto/advanced-query.dto";

@Injectable()
class CountriesService {
    constructor(private readonly repo: CountriesRepository) { }

    async getAllCountries(query: AdvancedQueryDto) {
        return this.repo.findAll(query);
    }

    async updateCountry(id: number, country: Prisma.CountryUpdateInput) {
        return this.repo.updateCountry(country, id);
    }
}

export default CountriesService;
