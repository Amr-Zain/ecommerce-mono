import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MESSAGE_CHANNELS, MESSAGE_PURPOSES } from '../message.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocalizedMessageContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  html?: string;
}

class MessageContentDto {
  @ValidateNested()
  @Type(() => LocalizedMessageContentDto)
  en!: LocalizedMessageContentDto;

  @ValidateNested()
  @Type(() => LocalizedMessageContentDto)
  ar!: LocalizedMessageContentDto;
}

export class CreateMessageTemplateDto {
  @IsString()
  @Matches(/^[a-z0-9_.-]+$/)
  @ApiProperty({ example: "welcome_email", description: 'key' })
  key!: string;

  @IsString()
  @MaxLength(120)
  @ApiProperty({ example: "Welcome Email", description: 'name' })
  name!: string;

  @IsEnum(MESSAGE_CHANNELS)
  @ApiProperty({ example: "email", description: 'channel' })
  channel!: string;

  @IsEnum(MESSAGE_PURPOSES)
  @ApiProperty({ example: "welcome", description: 'purpose' })
  purpose!: string;

  @ValidateNested()
  @Type(() => MessageContentDto)
  @ApiProperty({ example: {}, description: 'content' })
  content!: MessageContentDto;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: {}, description: 'variables' })
  variables?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;
}

export class UpdateMessageTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ApiPropertyOptional({ example: "Welcome Email", description: 'name' })
  name?: string;

  @IsOptional()
  @IsEnum(MESSAGE_CHANNELS)
  @ApiPropertyOptional({ example: "email", description: 'channel' })
  channel?: string;

  @IsOptional()
  @IsEnum(MESSAGE_PURPOSES)
  @ApiPropertyOptional({ example: "welcome", description: 'purpose' })
  purpose?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageContentDto)
  @ApiPropertyOptional({ example: {}, description: 'content' })
  content?: MessageContentDto;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: {}, description: 'variables' })
  variables?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;
}

export class PreviewMessageTemplateDto {
  @IsOptional()
  @IsEnum(MESSAGE_CHANNELS)
  @ApiPropertyOptional({ example: "email", description: 'channel' })
  channel?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "en", description: 'locale' })
  locale?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: {}, description: 'variables' })
  variables?: Record<string, unknown>;
}
