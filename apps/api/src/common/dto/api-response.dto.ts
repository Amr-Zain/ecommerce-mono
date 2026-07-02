import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total!: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages!: number;
}

export class ApiResponseDto<TData> {
  @ApiProperty({ example: true, description: 'Indicates whether the request succeeded' })
  success!: boolean;

  @ApiProperty({ description: 'Response payload' })
  data!: TData;
}

export class PaginatedApiResponseDto<TItem> {
  @ApiProperty({ example: true, description: 'Indicates whether the request succeeded' })
  success!: boolean;

  @ApiProperty({ description: 'List of items', isArray: true })
  items!: TItem[];

  @ApiProperty({ description: 'Pagination metadata', type: () => PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: true, description: 'Indicates whether the request succeeded' })
  success!: boolean;

  @ApiProperty({ example: 'Operation completed successfully', description: 'Human-readable message' })
  message!: string;
}

export class EmptyResponseDto {
  @ApiProperty({ example: true, description: 'Indicates whether the request succeeded' })
  success!: boolean;

  @ApiProperty({ example: null, description: 'Empty response payload', nullable: true })
  data!: null;
}

export class ErrorDetailDto {
  @ApiProperty({ example: 'email', description: 'Error type or code' })
  type!: string;

  @ApiProperty({ example: 'email must be a valid email address', description: 'Error message' })
  message!: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: 'Indicates that the request failed' })
  success!: boolean;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request', description: 'HTTP error phrase' })
  error!: string;

  @ApiProperty({ description: 'Detailed error messages', type: () => ErrorDetailDto, isArray: true })
  errors!: ErrorDetailDto[];
}
