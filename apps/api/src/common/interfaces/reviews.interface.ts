import { PaginatedResult } from '../dto/pagination.dto';

export interface ClientReviewUser {
  id: bigint;
  name: string | null;
}

export interface ClientReview {
  id: bigint;
  productId: bigint;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  user: ClientReviewUser;
  images?: unknown;
}

export interface AdminReviewUser {
  id: bigint;
  name: string | null;
  email: string | null;
  fullName?: string | null;
  image?: unknown;
}

export interface AdminReviewProduct {
  id: bigint;
  image?: unknown;
  [key: string]: unknown;
}

export interface AdminReview {
  id: bigint;
  productId: bigint;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  images?: unknown;
  userName: string;
  user: AdminReviewUser | null;
  product: AdminReviewProduct;
}

export interface ReviewOwner {
  id: bigint;
  userId: bigint;
  productId: bigint;
}

export const REVIEWS_REPOSITORY = Symbol('IReviewsRepository');

export interface IReviewsRepository {
  findAllAdmin(query: {
    page?: number;
    limit?: number;
    paginate?: boolean;
    filters?: Record<string, string | number | boolean>;
    sort?: Record<string, 'asc' | 'desc'>;
    search?: string;
  }): Promise<unknown>;
  findAdminById(id: bigint): Promise<AdminReview | null>;
  updateAdminReview(
    id: bigint,
    data: { isActive?: boolean; isApproved?: boolean; isVerified?: boolean },
  ): Promise<AdminReview>;
  findActiveVerifiedByProduct(productId: bigint): Promise<ClientReview[]>;
  findActiveVerifiedByProductPaginated(
    productId: bigint,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ClientReview>>;
  findUserReview(userId: bigint, productId: bigint): Promise<ClientReview | null>;
  createForUser(data: {
    userId: bigint;
    productId: bigint;
    rating: number;
    comment?: string;
    images?: string[];
  }): Promise<ClientReview>;
  findOwnerById(id: bigint): Promise<ReviewOwner | null>;
  updateClientReview(id: bigint, data: { rating?: number; comment?: string; images?: string[] }): Promise<ClientReview>;
  deleteById(id: bigint): Promise<ReviewOwner>;
}
