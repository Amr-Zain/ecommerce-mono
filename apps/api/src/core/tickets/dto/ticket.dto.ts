import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const TICKET_STATUSES = ['open', 'pending', 'resolved', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export class TicketAttachmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'HASH_FROM_UPLOAD', description: 'attachHash' })
  attachHash!: string;
}

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Welcome to Ecommerce', description: 'title' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sample description', description: 'description' })
  description!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentDto)
  @IsOptional()
  @ApiPropertyOptional({ example: [], description: 'attachments' })
  attachments?: TicketAttachmentDto[];
}

export class ReplyTicketDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'I need help with my order', description: 'body' })
  body!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentDto)
  @IsOptional()
  @ApiPropertyOptional({ example: [], description: 'attachments' })
  attachments?: TicketAttachmentDto[];
}

export class UpdateTicketDto {
  @IsIn(TICKET_STATUSES)
  @IsOptional()
  @ApiPropertyOptional({ example: 'shipped', description: 'status' })
  status?: TicketStatus;
}
