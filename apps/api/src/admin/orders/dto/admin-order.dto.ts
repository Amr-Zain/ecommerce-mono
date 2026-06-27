import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, IsEnum, IsNotEmpty, Min, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class RefundAllocationDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn(['wallet', 'original_payment', 'manual'], {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM'),
  })
  @ApiProperty({ example: 'wallet', description: 'destination' })
  destination!: 'wallet' | 'original_payment' | 'manual';

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiProperty({ example: 50, description: 'amount' })
  amount!: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '1', description: 'paymentTransactionId' })
  paymentTransactionId?: string;
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

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => RefundAllocationDto)
  @ApiPropertyOptional({ example: [], description: 'refundAllocations' })
  refundAllocations?: RefundAllocationDto[];
}

export class AdminOrderQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiPropertyOptional({ example: "shipped", description: 'status' })
  status?: OrderStatus;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "paid", description: 'paymentStatus' })
  paymentStatus?: string;
}
