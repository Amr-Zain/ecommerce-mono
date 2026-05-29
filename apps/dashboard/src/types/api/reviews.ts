import { Image } from "./general";

export interface Review {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    images: Image[];
    created_at: string;
    is_active: boolean;
    is_approved: boolean;
    user: {
        id: number;
        full_name: string;
        email: string;
        image: Image | null;
    };
    product: {
        id: number;
        name: string;
        image: Image | null;
    };
}
