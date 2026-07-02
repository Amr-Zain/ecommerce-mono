import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingItemDto {
  @ApiProperty({ example: 'loyalty_points_expiry_enabled' })
  @IsString()
  key!: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] })
  @IsDefined()
  value!: string | number | boolean;
}

export class UpdateSettingsDto {
  @ApiProperty({ type: [UpdateSettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingItemDto)
  settings!: UpdateSettingItemDto[];
}
