import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';

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
  status!: OrderStatus;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  reason?: string;
}

export class AdminOrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  status?: OrderStatus;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  paymentStatus?: string;
}
