export interface DashboardStatistics {
    filters?: DashboardFilters;
    users: {
        total: number;
        active: number;
        banned: number;
        new_today: number;
        new_this_week: number;
        new_this_month: number;
        growth_trend: number;
        by_type: Record<string, number>;
        by_tier: Array<{
            id?: number;
            tier_name: string;
            count: number;
        }>;
    };
    orders: {
        total: number;
        by_status: Record<string, number>;
        revenue: {
            total: number;
            today: number;
            this_week: number;
            this_month: number;
            this_year: number;
            trend: number;
        };
        average_order_value: number;
        orders_today: number;
        orders_this_week: number;
        orders_this_month: number;
        top_products: Array<{
            id: number;
            name: string;
            sold: number;
            revenue: number;
        }>;
    };
    products: {
        total: number;
        active: number;
        out_of_stock: number;
        low_stock: number;
        added_today: number;
        added_this_week: number;
        added_this_month: number;
        inventory_value: number;
        most_viewed: Array<{
            id: number;
            name: string;
            views: number;
        }>;
        most_wishlisted: Array<{
            id: number;
            name: string;
            wishlist_count: number;
        }>;
        recent_products?: Array<{
            id: number;
            name: string;
            stock: number;
            price: number;
            is_active: boolean;
            created_at: string;
        }>;
    };
    reviews: {
        total: number;
        pending_approval: number;
        average_rating: number;
        this_month: number;
        rating_distribution: Record<string, number>;
        most_reviewed: Array<{
            id: number;
            name: string;
            reviews_count: number;
            average_rating: number;
        }>;
    };
    loyalty: {
        total_points_distributed: number;
        total_points_redeemed: number;
        active_rewards: number;
        total_redeemed_rewards: number;
        points_this_month: number;
        users_by_tier: Array<{
            id?: number;
            tier_name: string;
            count: number;
        }>;
    };
    financial: {
        total_revenue: number;
        revenue_this_month: number;
        revenue_today: number;
        pending_payments: number;
        refunded_this_month: number;
        net_revenue: number;
    };
    geo: {
        generated_at: string;
        countries: Array<{
            country: {
                id: number;
                code: string;
                name: string;
            };
            orders_summary: {
                total: number;
                paid: number;
                revenue: number;
            };
            users_summary: {
                total: number;
                active: number;
                banned: number;
            };
        }>;
    };
    recent_activity: {
        orders: Array<{
            id: number;
            order_number: number;
            user_name: string;
            total: number;
            status: string;
            created_at: string;
        }>;
        users: Array<{
            id: number;
            full_name: string;
            email: string | null;
            is_active: boolean;
            created_at: string;
        }>;
        reviews: Array<{
            id: number;
            user_name: string;
            product_name: string | null;
            rating: number;
            is_approved: boolean;
            created_at: string;
        }>;
        products: Array<{
            id: number;
            name: string;
            stock: number;
            price: number;
            is_active: boolean;
            created_at: string;
        }>;
    };
    analytics: DashboardAnalytics;
}

export type DashboardPreset = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom';
export type DashboardGranularity = 'auto' | 'day' | 'week' | 'month';

export interface DashboardFilters {
    preset: DashboardPreset;
    from: string;
    to: string;
    granularity: Exclude<DashboardGranularity, 'auto'>;
    sections: Array<string>;
}

export interface DashboardQueryParams {
    preset?: DashboardPreset;
    from?: string;
    to?: string;
    granularity?: DashboardGranularity;
    compare?: boolean;
    sections?: string;
}

export interface DashboardNameValuePoint {
    name: string;
    value: number;
}

export interface DashboardSalesTrendPoint {
    period: string;
    revenue: number;
    netRevenue: number;
    orders: number;
    refunds: number;
}

export interface DashboardCustomerGrowthPoint {
    period: string;
    newUsers: number;
    activeUsers: number;
}

export interface DashboardInventoryStockPoint {
    state: string;
    count: number;
}

export interface DashboardReviewRatingPoint {
    rating: string;
    count: number;
}

export interface DashboardLoyaltyTrendPoint {
    period: string;
    earned: number;
    redeemed: number;
}

export interface DashboardAnalytics {
    salesTrend: Array<DashboardSalesTrendPoint>;
    ordersByStatus: Array<DashboardNameValuePoint>;
    ordersByPaymentMethod: Array<DashboardNameValuePoint>;
    paymentHealth: Array<DashboardNameValuePoint>;
    customerSegments: Array<DashboardNameValuePoint>;
    customerGrowth: Array<DashboardCustomerGrowthPoint>;
    inventoryStockStates: Array<DashboardInventoryStockPoint>;
    reviewRatings: Array<DashboardReviewRatingPoint>;
    loyaltyPointsTrend: Array<DashboardLoyaltyTrendPoint>;
    businessMetrics: DashboardBusinessMetrics;
    operationalAlerts: DashboardOperationalAlerts;
}

export interface DashboardBusinessMetrics {
    grossRevenue: number;
    netRevenue: number;
    orders: number;
    averageOrderValue: number;
    refundRate: number;
    repeatCustomerRate: number;
    reviewApprovalRate: number;
    inventoryAtRisk: number;
    pendingOperations: number;
}

export interface DashboardOperationalAlerts {
    pendingPaymentsCount: number;
    pendingPaymentsAmount: number;
    pendingReviews: number;
    openTickets: number;
    openReturns: number;
    openExchanges: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    refundRequestsValue: number;
}
