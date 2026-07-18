import { PrismaService } from '@/prisma/prisma.service';
import { DashboardDateRange, DashboardGranularity } from './dashboard-query.port';

type Bucket = { period: string; start: Date; end: Date };

export abstract class DashboardPrismaQueryRepository {
  constructor(protected readonly prisma: PrismaService) {}

  protected productListItem(
    product: {
      id: bigint;
      translations: { langId: string; name: string }[];
      variants: { stockQuantity: number; price: unknown }[];
      isActive: boolean;
      createdAt: Date;
    },
    langId: string,
  ) {
    const variant = product.variants[0];
    return {
      id: Number(product.id),
      name: this.translationName(product.translations, langId) || 'Product',
      stock: variant?.stockQuantity ?? 0,
      price: this.decimalToNumber(variant?.price ?? 0),
      is_active: product.isActive,
      created_at: this.formatDate(product.createdAt),
    };
  }

  protected makeBuckets(range: DashboardDateRange): Bucket[] {
    const buckets: Bucket[] = [];
    let cursor = this.startOfDay(range.from);
    while (cursor <= range.to) {
      const start = new Date(cursor);
      const end =
        range.granularity === 'month'
          ? this.endOfMonth(start)
          : range.granularity === 'week'
            ? this.endOfDay(this.addDays(start, 6))
            : this.endOfDay(start);
      buckets.push({ period: this.bucketLabel(start, range.granularity), start, end: end > range.to ? range.to : end });
      cursor =
        range.granularity === 'month'
          ? this.addMonths(start, 1)
          : range.granularity === 'week'
            ? this.addDays(start, 7)
            : this.addDays(start, 1);
    }
    return buckets;
  }

  protected inBucket(date: Date, bucket: Bucket) {
    return date >= bucket.start && date <= bucket.end;
  }

  protected bucketLabel(date: Date, granularity: DashboardGranularity) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return granularity === 'month' ? `${year}-${month}` : `${year}-${month}-${day}`;
  }

  protected previousRangeWhere(range: DashboardDateRange) {
    const duration = range.to.getTime() - range.from.getTime();
    const previousTo = new Date(range.from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration);
    return { gte: previousFrom, lte: previousTo };
  }

  protected countBy<T>(items: T[], key: (item: T) => string) {
    return items.reduce<Record<string, number>>((acc, item) => {
      const name = key(item) || 'unknown';
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});
  }

  protected translationName(translations: { langId: string; name: string }[] | undefined, langId: string) {
    return translations?.find((translation) => translation.langId === langId)?.name ?? translations?.[0]?.name ?? '';
  }

  protected decimalToNumber(value: unknown) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value) || 0;
    if (typeof value === 'object') {
      const stringifier = (value as { toString?: () => string }).toString;
      if (typeof stringifier === 'function' && stringifier !== Object.prototype.toString) {
        return Number(stringifier.call(value)) || 0;
      }
    }
    return 0;
  }

  protected percentageChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return this.round(((current - previous) / previous) * 100);
  }

  protected round(value: number) {
    return Math.round(value * 100) / 100;
  }

  protected formatDate(date: Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  protected startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  protected endOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }

  protected startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  protected endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  protected startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
  }

  protected addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  protected addMonths(date: Date, months: number) {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + months);
    return copy;
  }
}
