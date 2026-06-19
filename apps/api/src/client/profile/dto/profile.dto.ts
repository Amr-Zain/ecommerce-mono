import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Updated Name", description: 'name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "+966512345678", description: 'phone' })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "966", description: 'phoneCode' })
  phoneCode?: string;
}

export class UpdateProfileImageDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "mock-main-image-hash", description: 'image' })
  image?: string;
}
