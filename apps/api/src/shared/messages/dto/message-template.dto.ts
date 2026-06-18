import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MESSAGE_CHANNELS, MESSAGE_PURPOSES } from '../message.constants';

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
  key!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEnum(MESSAGE_CHANNELS)
  channel!: string;

  @IsEnum(MESSAGE_PURPOSES)
  purpose!: string;

  @ValidateNested()
  @Type(() => MessageContentDto)
  content!: MessageContentDto;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMessageTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(MESSAGE_CHANNELS)
  channel?: string;

  @IsOptional()
  @IsEnum(MESSAGE_PURPOSES)
  purpose?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageContentDto)
  content?: MessageContentDto;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PreviewMessageTemplateDto {
  @IsOptional()
  @IsEnum(MESSAGE_CHANNELS)
  channel?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}
