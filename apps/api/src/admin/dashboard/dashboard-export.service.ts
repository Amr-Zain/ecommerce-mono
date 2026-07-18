import { Injectable } from '@nestjs/common';
import { DashboardExportDataset, DashboardExportQueryDto } from './dto/dashboard-export-query.dto';
import { DashboardQueryHandler } from './dashboard-query.handler';

type DashboardExportRow = {
  dataset: string;
  series: string;
  period?: string;
  label?: string;
  value: string | number;
};
const DASHBOARD_EXPORT_DATASET_ORDER: Exclude<DashboardExportDataset, 'all'>[] = [
  'overview',
  'sales',
  'customers',
  'inventory',
  'reviews',
  'loyalty',
  'geo',
];

@Injectable()
export class DashboardExportService {
  constructor(private readonly dashboardQueries: DashboardQueryHandler) {}

  async export(query: DashboardExportQueryDto = {}, langId = 'en') {
    const dataset = query.dataset ?? 'overview';
    const sections = this.exportSections(dataset);
    const home = (await this.dashboardQueries.getHome({ ...query, sections }, langId)) as Record<string, unknown>;
    const filters = this.record(home.filters);
    const rows = this.exportRows(home, dataset);
    const columns = ['dataset', 'series', 'period', 'label', 'value', 'from', 'to', 'granularity'];
    const csvRows = rows.map((row) => [
      row.dataset,
      row.series,
      row.period ?? '',
      row.label ?? '',
      row.value,
      filters.from ?? '',
      filters.to ?? '',
      filters.granularity ?? '',
    ]);
    const content = `\uFEFF${[columns, ...csvRows]
      .map((row) => row.map((cell) => this.csvCell(cell)).join(','))
      .join('\r\n')}`;
    return {
      filename: `dashboard-${dataset}-${new Date().toISOString().slice(0, 10)}.csv`,
      content,
      rowCount: rows.length,
    };
  }

  private exportSections(dataset: DashboardExportDataset) {
    const sectionMap: Record<DashboardExportDataset, string | undefined> = {
      all: undefined,
      overview: 'overview,charts',
      sales: 'sales,charts',
      customers: 'customers,charts',
      inventory: 'inventory,charts',
      reviews: 'reviews,charts',
      loyalty: 'loyalty,charts',
      geo: 'geo',
    };
    return sectionMap[dataset];
  }

  private exportRows(home: Record<string, unknown>, dataset: DashboardExportDataset): DashboardExportRow[] {
    const analytics = this.record(home.analytics);
    const datasets = dataset === 'all' ? DASHBOARD_EXPORT_DATASET_ORDER : [dataset];
    return datasets.flatMap((item) => {
      if (item === 'overview') {
        return Object.entries(this.record(analytics.businessMetrics)).map(([label, value]) => ({
          dataset: item,
          series: 'business_metric',
          label,
          value: this.exportValue(value),
        }));
      }
      if (item === 'sales') {
        return [
          ...this.trendRows(item, analytics.salesTrend, ['revenue', 'netRevenue', 'orders', 'refunds']),
          ...this.breakdownRows(item, 'order_status', analytics.ordersByStatus),
          ...this.breakdownRows(item, 'payment_method', analytics.ordersByPaymentMethod),
          ...this.breakdownRows(item, 'payment_health', analytics.paymentHealth),
        ];
      }
      if (item === 'customers') {
        return [
          ...this.trendRows(item, analytics.customerGrowth, ['newUsers', 'activeUsers']),
          ...this.breakdownRows(item, 'customer_segment', analytics.customerSegments),
        ];
      }
      if (item === 'inventory') {
        return this.array(analytics.inventoryStockStates).map((point) => {
          const value = this.record(point);
          return {
            dataset: item,
            series: 'stock_state',
            label: this.textValue(value.state),
            value: this.exportValue(value.count),
          };
        });
      }
      if (item === 'reviews') {
        return this.array(analytics.reviewRatings).map((point) => {
          const value = this.record(point);
          return {
            dataset: item,
            series: 'rating',
            label: this.textValue(value.rating),
            value: this.exportValue(value.count),
          };
        });
      }
      if (item === 'loyalty') {
        return this.trendRows(item, analytics.loyaltyPointsTrend, ['earned', 'redeemed']);
      }
      if (item === 'geo') {
        return this.array(this.record(home.geo).countries).flatMap((entry) => {
          const countryRow = this.record(entry);
          const country = this.record(countryRow.country);
          const orders = this.record(countryRow.orders_summary);
          const users = this.record(countryRow.users_summary);
          const label = this.textValue(country.name ?? country.code);
          return [
            { dataset: item, series: 'orders', label, value: this.exportValue(orders.total) },
            { dataset: item, series: 'paid_orders', label, value: this.exportValue(orders.paid) },
            { dataset: item, series: 'revenue', label, value: this.exportValue(orders.revenue) },
            { dataset: item, series: 'users', label, value: this.exportValue(users.total) },
          ];
        });
      }
      return [];
    });
  }

  private trendRows(dataset: string, points: unknown, seriesNames: string[]): DashboardExportRow[] {
    return this.array(points).flatMap((point) => {
      const value = this.record(point);
      return seriesNames.map((series) => ({
        dataset,
        series,
        period: this.textValue(value.period),
        value: this.exportValue(value[series]),
      }));
    });
  }

  private breakdownRows(dataset: string, series: string, points: unknown): DashboardExportRow[] {
    return this.array(points).map((point) => {
      const value = this.record(point);
      return {
        dataset,
        series,
        label: this.textValue(value.name),
        value: this.exportValue(value.value),
      };
    });
  }

  private record(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  }

  private array(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private exportValue(value: unknown): string | number {
    return typeof value === 'number' || typeof value === 'string' ? value : '';
  }

  private textValue(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number' ? `${value}` : '';
  }

  private csvCell(value: unknown) {
    const text = `${this.exportValue(value)}`;
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }
}
