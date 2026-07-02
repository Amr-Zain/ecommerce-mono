import { ArrayNotEmpty, IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { MESSAGE_CHANNELS, MESSAGE_RECIPIENT_TYPES } from '../message.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @IsString()
  @ApiProperty({ example: 'welcome_email', description: 'templateId' })
  templateId!: string;

  @IsEnum(MESSAGE_CHANNELS)
  @ApiProperty({ example: 'email', description: 'channel' })
  channel!: string;

  @IsEnum(MESSAGE_RECIPIENT_TYPES)
  @ApiProperty({ example: 'user', description: 'recipientType' })
  recipientType!: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ApiPropertyOptional({ example: [], description: 'recipientIds' })
  recipientIds?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Custom Notification Title', description: 'titleOverride' })
  titleOverride?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: {}, description: 'variables' })
  variables?: Record<string, unknown>;
}
