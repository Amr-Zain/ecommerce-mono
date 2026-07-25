import { IsOptional, IsString, IsNotEmpty, IsIn } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { I18nTranslations } from '../../generated/i18n.generated';

// API whitelist: persistence schema names must never be reflected into request validation.
export const ALLOWED_MEDIA_MODELS = [
  'role',
  'roletranslation',
  'permission',
  'user',
  'emailotpchallenge',
  'anonymoussession',
  'refreshtoken',
  'cart',
  'cartitem',
  'wishlistitem',
  'outboxevent',
  'eventconsumerreceipt',
  'notification',
  'messagetemplate',
  'messagecampaign',
  'messagecampaignrecipient',
  'collection',
  'collectiontranslation',
  'product',
  'producttranslation',
  'attribute',
  'attributetranslation',
  'attributevalue',
  'attributevaluetranslation',
  'productvariant',
  'variantattribute',
  'inventorylog',
  'pricehistory',
  'staticpage',
  'staticpagetranslation',
  'pagesection',
  'pagesectiontranslation',
  'slider',
  'slidertranslation',
  'faq',
  'faqtranslation',
  'review',
  'paymentgateway',
  'paymentsession',
  'country',
  'countrytranslation',
  'city',
  'citytranslation',
  'address',
  'media',
  'order',
  'orderitem',
  'orderitemtranslation',
  'paymenttransaction',
  'orderstatushistory',
  'returnrequest',
  'returnrequestitem',
  'exchangerequest',
  'returnexchangestatushistory',
  'exchangerequestitem',
  'pendingcheckout',
  'couponreservation',
  'stockreservation',
  'coupon',
  'showroom',
  'showroomtranslation',
  'smsprovider',
  'wallet',
  'wallettransaction',
  'walletwithdrawalrequest',
  'appsetting',
  'loyaltyaccount',
  'tier',
  'loyaltytier',
  'loyaltytiertranslation',
  'earningrule',
  'loyaltyearningrule',
  'loyaltyearningruletranslation',
  'reward',
  'loyaltyreward',
  'loyaltyrewardtranslation',
  'loyaltypointtransaction',
  'loyaltyrewardredemption',
  'ticket',
  'ticketmessage',
] as const;

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MEDIA_MODELS, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_MEDIA_MODEL') })
  @ApiProperty({ example: 'product', description: 'model' })
  model!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '1', description: 'modelId' })
  modelId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'products', description: 'collection' })
  collection?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'email', description: 'type' })
  type?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'HASH_FROM_UPLOAD', description: 'attachHash' })
  attachHash?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'isMain' })
  isMain?: boolean;
}
