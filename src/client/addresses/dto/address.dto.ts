import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  address!: string;

  @IsOptional()
  @IsNumber()
  cityId?: number;

  @IsOptional()
  @IsNumber()
  countryId?: number;

  @IsOptional()
  @IsString()
  streetName?: string;

  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  cityId?: number;

  @IsOptional()
  @IsNumber()
  countryId?: number;

  @IsOptional()
  @IsString()
  streetName?: string;

  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}