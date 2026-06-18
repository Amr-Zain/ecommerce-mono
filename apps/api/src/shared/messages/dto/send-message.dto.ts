import { ArrayNotEmpty, IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { MESSAGE_CHANNELS, MESSAGE_RECIPIENT_TYPES } from '../message.constants';

export class SendMessageDto {
  @IsString()
  templateId!: string;

  @IsEnum(MESSAGE_CHANNELS)
  channel!: string;

  @IsEnum(MESSAGE_RECIPIENT_TYPES)
  recipientType!: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  recipientIds?: string[];

  @IsOptional()
  @IsString()
  titleOverride?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}
