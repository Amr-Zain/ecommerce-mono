import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneCode?: string;
}

export class UpdateProfileImageDto {
  @IsOptional()
  @IsString()
  image?: string;
}