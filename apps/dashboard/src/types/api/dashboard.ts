export interface DashboardStatistics {
    users: {
        total: number;
        active: number;
        banned: number;
        new_today: number;
        new_this_week: number;
        new_this_month: number;
        growth_trend: number;
        by_type: Record<string, number>;
        by_tier: {
            id?: number;
            tier_name: string;
            count: number;
        }[];
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
        top_products: {
            id: number;
            name: string;
            sold: number;
            revenue: number;
        }[];
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
        most_viewed: {
            id: number;
            name: string;
            views: number;
        }[];
        most_wishlisted: {
            id: number;
            name: string;
            wishlist_count: number;
        }[];
    };
    reviews: {
        total: number;
        pending_approval: number;
        average_rating: number;
        this_month: number;
        rating_distribution: Record<string, number>;
        most_reviewed: {
            id: number;
            name: string;
            reviews_count: number;
            average_rating: number;
        }[];
    };
    loyalty: {
        total_points_distributed: number;
        total_points_redeemed: number;
        active_rewards: number;
        total_redeemed_rewards: number;
        points_this_month: number;
        users_by_tier: {
            id?: number;
            tier_name: string;
            count: number;
        }[];
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
        countries: {
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
        }[];
    };
    recent_activity: {
        orders: {
            id: number;
            order_number: number;
            user_name: string;
            total: number;
            status: string;
            created_at: string;
        }[];
        users: {
            id: number;
            full_name: string;
            email: string | null;
            is_active: boolean;
            created_at: string;
        }[];
        reviews: {
            id: number;
            user_name: string;
            product_name: string | null;
            rating: number;
            is_approved: boolean;
            created_at: string;
        }[];
        products: {
            id: number;
            name: string;
            stock: number;
            price: number;
            is_active: boolean;
            created_at: string;
        }[];
    };
}
