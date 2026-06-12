import { Injectable } from '@nestjs/common';
import { COUNTRY_CODES, DISCOUNT_TYPES, TAX_RATES } from '@/common/constants/commerce.constants';

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

      if (discountType === DISCOUNT_TYPES.percentage) {
        actualPrice = rawPrice - rawPrice * (discountValue / 100);
      } else if (discountType === DISCOUNT_TYPES.fixed) {
        actualPrice = rawPrice - discountValue;
      }

      return {
        price: Math.max(0, Number(actualPrice.toFixed(2))),
        compareAtPrice: Number(compareAtPrice.toFixed(2)),
      };
    }

    return { price: Number(rawPrice.toFixed(2)) };
  }

  calculateVat(
    subtotal: number,
    phoneCode?: string | null,
    countryShortName?: string | null,
  ): { vatRate: number; vatAmount: number } {
    const isSA =
      phoneCode?.replace(/[^0-9]/g, '') === COUNTRY_CODES.saudiPhoneCode ||
      COUNTRY_CODES.saudiShortNames.includes(countryShortName?.toUpperCase() as any);

    if (isSA) {
      const vatRate = TAX_RATES.saudiArabiaVat;
      const vatAmount = Number((subtotal * vatRate).toFixed(2));
      return { vatRate, vatAmount };
    }

    return { vatRate: 0, vatAmount: 0 };
  }

  calculateTotals(
    items: { price: number; quantity: number }[],
    shippingFee: number,
    discountAmount: number,
    phoneCode?: string | null,
    countryShortName?: string | null,
  ): {
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    vatAmount: number;
    vatRate: number;
    totalPrice: number;
  } {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const netSubtotal = Math.max(0, subtotal - discountAmount);

    const { vatRate, vatAmount } = this.calculateVat(netSubtotal, phoneCode, countryShortName);

    const rawTotal = netSubtotal + shippingFee + vatAmount;
    const totalPrice = Math.max(0, Number(rawTotal.toFixed(2)));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee: Number(shippingFee.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      vatRate,
      totalPrice,
    };
  }
}
