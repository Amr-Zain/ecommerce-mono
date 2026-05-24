import { Injectable } from '@nestjs/common';

export interface Discount {
  type: string | null;
  value: number | null;
}

@Injectable()
export class PricingService {
  computePrice(
    basePrice: number,
    variantDiscount?: Discount | null,
    productDiscount?: Discount | null,
  ): { price: number; compareAtPrice?: number } {
    const rawPrice = basePrice ?? 0;

    // Variant discount takes priority, fallback to product discount
    let discountType: string | null = null;
    let discountValue: number | null = null;

    if (variantDiscount && variantDiscount.type && variantDiscount.value && variantDiscount.value > 0) {
      discountType = variantDiscount.type;
      discountValue = variantDiscount.value;
    } else if (productDiscount && productDiscount.type && productDiscount.value && productDiscount.value > 0) {
      discountType = productDiscount.type;
      discountValue = productDiscount.value;
    }

    if (discountType && discountValue && discountValue > 0) {
      const compareAtPrice = rawPrice;
      let actualPrice = rawPrice;

      if (discountType === 'PERCENTAGE') {
        actualPrice = rawPrice - (rawPrice * (discountValue / 100));
      } else if (discountType === 'FIXED') {
        actualPrice = rawPrice - discountValue;
      }

      return {
        price: Math.max(0, Number(actualPrice.toFixed(2))),
        compareAtPrice: Number(compareAtPrice.toFixed(2)),
      };
    }

    return { price: Number(rawPrice.toFixed(2)) };
  }
}
