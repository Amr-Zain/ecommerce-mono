import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Parse BigInt pipe
 * Converts string to BigInt for route parameters
 */
@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
    transform(value: string): bigint {
        try {
            const parsed = BigInt(value);
            if (parsed < 0) {
                throw new BadRequestException('ID must be a positive number');
            }
            return parsed;
        } catch (error) {
            throw new BadRequestException('Invalid ID format');
        }
    }
}
