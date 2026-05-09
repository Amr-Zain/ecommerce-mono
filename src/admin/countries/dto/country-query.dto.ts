import { AdvancedQueryDto } from '../../../common/dto/advanced-query.dto';

export class CountryQueryDto extends AdvancedQueryDto {
    // All filtering is now handled through the filters object
    // Example: ?filters[isActive]=1&search=egypt
}
