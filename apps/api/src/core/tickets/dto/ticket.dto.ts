import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export const TICKET_STATUSES = ['open', 'pending', 'resolved', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export class TicketAttachmentDto {
  @IsString()
  @IsNotEmpty()
  attachHash!: string;
}

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentDto)
  @IsOptional()
  attachments?: TicketAttachmentDto[];
}

export class ReplyTicketDto {
  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentDto)
  @IsOptional()
  attachments?: TicketAttachmentDto[];
}

export class UpdateTicketDto {
  @IsIn(TICKET_STATUSES)
  @IsOptional()
  status?: TicketStatus;
}
