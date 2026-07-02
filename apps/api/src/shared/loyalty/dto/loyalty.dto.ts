import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LOYALTY_POINTS_TYPES, LOYALTY_REWARD_TYPES } from '../loyalty.constants';

const optionalNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
};

const optionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === '1' || value === 'true' || value === 1;
};

export class LoyaltyNameTranslationDto {
  @IsString()
  @IsNotEmpty()
  langId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class LoyaltyDescriptionTranslationDto extends LoyaltyNameTranslationDto {
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateTierDto {
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  multiplier!: number;

  @Transform(optionalNumber)
  @IsInt()
  @Min(0)
  minLifetimePoints!: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyNameTranslationDto)
  translations!: LoyaltyNameTranslationDto[];
}

export class UpdateTierDto {
  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  multiplier?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsInt()
  @Min(0)
  minLifetimePoints?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyNameTranslationDto)
  translations?: LoyaltyNameTranslationDto[];
}

export class CreateEarningRuleDto {
  @IsString()
  @IsNotEmpty()
  eventKey!: string;

  @IsIn(Object.values(LOYALTY_POINTS_TYPES))
  pointsType!: string;

  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  pointsValue!: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyDescriptionTranslationDto)
  translations!: LoyaltyDescriptionTranslationDto[];
}

export class UpdateEarningRuleDto {
  @IsOptional()
  @IsIn(Object.values(LOYALTY_POINTS_TYPES))
  pointsType?: string;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  pointsValue?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyDescriptionTranslationDto)
  translations?: LoyaltyDescriptionTranslationDto[];
}

export class CreateRewardDto {
  @Transform(optionalNumber)
  @IsInt()
  @Min(1)
  pointsRequired!: number;

  @IsIn(Object.values(LOYALTY_REWARD_TYPES))
  rewardType!: string;

  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  rewardValue!: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyDescriptionTranslationDto)
  translations!: LoyaltyDescriptionTranslationDto[];
}

export class UpdateRewardDto {
  @IsOptional()
  @Transform(optionalNumber)
  @IsInt()
  @Min(1)
  pointsRequired?: number;

  @IsOptional()
  @IsIn(Object.values(LOYALTY_REWARD_TYPES))
  rewardType?: string;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  rewardValue?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyDescriptionTranslationDto)
  translations?: LoyaltyDescriptionTranslationDto[];
}
