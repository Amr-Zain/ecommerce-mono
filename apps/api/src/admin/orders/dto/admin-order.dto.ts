import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsEnum(OrderStatus, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ example: "shipped", description: 'status' })
  status!: OrderStatus;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "RESTOCK", description: 'reason' })
  reason?: string;
}

export class AdminOrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiPropertyOptional({ example: "shipped", description: 'status' })
  status?: OrderStatus;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "paid", description: 'paymentStatus' })
  paymentStatus?: string;
}
