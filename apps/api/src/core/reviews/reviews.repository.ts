import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { BaseRepository, ScalarFields } from '@/common/repositories/base.repository';
import { AdminReview, ClientReview, IReviewsRepository, ReviewOwner } from '@/common/interfaces';
import { MediaType } from '@/media/enums/media-type.enum';
import { Prisma } from '@prisma/client';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { PaginationUtil } from '@/common/utils/pagination.util';

type ReviewRecord = ClientReview & { userId?: bigint };

const adminReviewInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  product: {
    include: {
      translations: true,
    },
  },
} satisfies Prisma.ReviewInclude;

type AdminReviewRecord = Prisma.ReviewGetPayload<{ include: typeof adminReviewInclude }>;

@Injectable()
export class ReviewsRepository extends BaseRepository<ReviewRecord> implements IReviewsRepository {
  protected readonly mediaConfig = {
    images: { collection: 'images', single: false, allowedTypes: [MediaType.IMAGE] },
  };

  /**
   * Demonstrates relation search:
   * - 'comment' is a direct field on the review model
   * - 'user.name', 'user.email' are fields on the related `user` table
   * - 'product.translations.name' is a field on the product's translations
   */
  protected readonly searchConfig = {
    directFields: ['comment'] satisfies ScalarFields<ReviewRecord>[],
    relationFields: [
      { relation: 'user', fields: ['name', 'email'] },
      { relation: 'product', fields: ['name'], isTranslation: true },
    ],
  };

  protected readonly allowedIncludes = {
    user: { select: { id: true, name: true, email: true } },
    product: { include: { translations: true } },
  };

  constructor(prisma: PrismaService, mediaService: MediaService, queryBuilder: QueryBuilderService) {
    super(prisma, mediaService, queryBuilder);
  }

  protected getModel() {
    return this.prisma.review;
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    paginate?: boolean;
    filters?: Record<string, string | number | boolean>;
    sort?: Record<string, 'asc' | 'desc'>;
    search?: string;
  }) {
    const where = this.buildAdminWhereClause(query);
    const orderBy = this.buildAdminOrderBy(query.sort);
    const queryArgs = { where, orderBy, include: adminReviewInclude };

    if (query.paginate === false) {
      const reviews = await this.prisma.review.findMany(queryArgs);
      return this.transformAdminMany(reviews);
    }

    const { skip, take } = PaginationUtil.getPrismaParams(query);
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({ ...queryArgs, skip, take }),
      this.prisma.review.count({ where }),
    ]);

    return PaginationUtil.createResult(
      await this.transformAdminMany(reviews),
      query.page || 1,
      query.limit || 10,
      total,
    );
  }

  async findAdminById(id: bigint): Promise<AdminReview | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: adminReviewInclude,
    });

    return review ? this.transformAdminReview(review) : null;
  }

  async updateAdminReview(
    id: bigint,
    data: { isActive?: boolean; isApproved?: boolean; isVerified?: boolean },
  ): Promise<AdminReview> {
    const review = await this.prisma.review.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...((data.isApproved !== undefined || data.isVerified !== undefined) && {
          isVerified: data.isApproved ?? data.isVerified,
        }),
      },
      include: adminReviewInclude,
    });

    return this.transformAdminReview(review);
  }

  async findActiveVerifiedByProduct(productId: bigint): Promise<ClientReview[]> {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isActive: true, isVerified: true },
      select: this.clientReviewSelect(),
      orderBy: { createdAt: 'desc' },
    });

    return this.mergeMedia(reviews);
  }

  async findActiveVerifiedByProductPaginated(productId: bigint, page: number, limit: number) {
    const where = { productId, isActive: true, isVerified: true };
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: this.clientReviewSelect(),
        orderBy: { createdAt: 'desc' },
        skip: PaginationUtil.getSkip(page, limit),
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);
    return PaginationUtil.createResult(await this.mergeMedia(reviews), page, limit, total);
  }

  async findUserReview(userId: bigint, productId: bigint): Promise<ClientReview | null> {
    const review = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: this.clientReviewSelect(),
    });
    return review ? this.mergeMedia(review) : null;
  }

  async createForUser(data: {
    userId: bigint;
    productId: bigint;
    rating: number;
    comment?: string;
    images?: string[];
  }): Promise<ClientReview> {
    return this.create(data, { select: this.clientReviewSelect() });
  }

  async findOwnerById(id: bigint): Promise<ReviewOwner | null> {
    return this.prisma.review.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
  }

  async updateClientReview(
    id: bigint,
    data: { rating?: number; comment?: string; images?: string[] },
  ): Promise<ClientReview> {
    return this.update(id, { ...data, isVerified: false }, { select: this.clientReviewSelect() });
  }

  async deleteById(id: bigint): Promise<ReviewOwner> {
    return this.delete(id) as Promise<ReviewOwner>;
  }

  private clientReviewSelect() {
    return {
      id: true,
      productId: true,
      rating: true,
      comment: true,
      isVerified: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    } as const;
  }

  /**
   * Admin where clause uses the base buildWhereClause which now handles
   * direct + relation search via searchConfig automatically.
   */
  private buildAdminWhereClause(query: {
    filters?: Record<string, string | number | boolean>;
    search?: string;
  }): Prisma.ReviewWhereInput {
    const filters = { ...(query.filters || {}) } as Record<string, string | number | boolean>;

    for (const key of ['userId', 'productId', 'rating']) {
      if (filters[key] !== undefined && filters[key] !== '') {
        filters[key] = Number(filters[key]);
      }
    }

    // Leverage the base buildWhereClause which uses searchConfig
    return this.buildWhereClause({ filters, search: query.search });
  }

  private buildAdminOrderBy(sort?: Record<string, 'asc' | 'desc'>): Prisma.ReviewOrderByWithRelationInput {
    if (!sort || Object.keys(sort).length === 0) {
      return { createdAt: 'desc' };
    }

    const [field, direction] = Object.entries(sort)[0];
    return { [field]: direction };
  }

  private async transformAdminMany(reviews: AdminReviewRecord[]) {
    return Promise.all(reviews.map((review) => this.transformAdminReview(review)));
  }

  private async transformAdminReview(review: AdminReviewRecord): Promise<AdminReview> {
    const [images, productImages] = await Promise.all([
      this.mediaService?.findByEntity('review', review.id) ?? [],
      this.mediaService?.findByEntity('product', review.productId, 'image') ?? [],
    ]);

    return {
      ...review,
      isApproved: review.isVerified,
      images,
      userName: review.user?.name ?? '',
      user: review.user
        ? {
            ...review.user,
            fullName: review.user.name,
            image: null,
          }
        : null,
      product: {
        ...review.product,
        image: productImages[0] ?? null,
      },
    };
  }
}
