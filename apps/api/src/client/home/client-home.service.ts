import { Injectable, Inject } from '@nestjs/common';
import {
  SLIDERS_REPOSITORY,
  ISlidersRepository,
  COLLECTIONS_REPOSITORY,
  ICollectionsRepository,
  PRODUCTS_REPOSITORY,
  IProductsRepository,
} from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';

@Injectable()
export class ClientHomeService {
  constructor(
    @Inject(SLIDERS_REPOSITORY) private readonly slidersRepo: ISlidersRepository,
    @Inject(COLLECTIONS_REPOSITORY) private readonly collectionsRepo: ICollectionsRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository,
  ) {}

  async getHomePage(langId: string = 'en') {
    const sliderQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    const collectionQuery: CollectionQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
      customFilter: 'collection',
    };
    const productQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };

    const [slidersResult, collectionsResult, productsResult] = await Promise.all([
      this.slidersRepo.findAll(sliderQuery, langId),
      this.collectionsRepo.findAll(collectionQuery, langId),
      this.productsRepo.findAll(productQuery, langId),
    ]);

    const sliders = Array.isArray(slidersResult) ? slidersResult : slidersResult.data;
    const collections = Array.isArray(collectionsResult) ? collectionsResult : collectionsResult.data;
    const products = Array.isArray(productsResult) ? productsResult : productsResult.data;
    const homeProducts = products.map((product) => this.formatProduct(product));
    const homeCollections = collections.map((collection) => this.formatCollection(collection));

    return {
      activeOffer: null,
      sliders: sliders.map((slider) => ({
        id: slider.id,
        title: slider.translations?.[0]?.title ?? '',
        image: this.mediaPath(slider.slide),
        sortOrder: slider.sortOrder,
      })),
      collections: homeCollections,
      newArrivals: homeProducts.slice(0, 8),
      bestSelling: homeProducts.slice(8, 16).length > 0 ? homeProducts.slice(8, 16) : homeProducts.slice(0, 8),
      lookingFor: homeCollections.slice(0, 8),
      showRooms: {
        count: 0,
        title: 'Find A Showroom Near You',
        body: 'Explore our showrooms to experience our collections in person.',
        image: null,
      },
      recentlyViewed: [],
    };
  }

  private formatCollection(collection: any) {
    return {
      id: collection.id,
      slug: collection.slug,
      name: collection.translations?.[0]?.name ?? '',
      image: this.mediaPath(collection.image),
      sortOrder: collection.sortOrder,
      hasChildren: collection.hasChildren ?? false,
    };
  }

  private formatProduct(product: any) {
    const variants = product.variants ?? [];
    const variant = variants[0];
    const price = Number(product.price ?? variant?.price ?? 0);
    const compareAtPrice = Number(product.compareAtPrice ?? variant?.compareAtPrice ?? price);
    const finalPrice = Math.min(price, compareAtPrice || price);

    return {
      id: product.id,
      name: product.translations?.[0]?.name ?? '',
      description: product.translations?.[0]?.description ?? null,
      images: [
        this.mediaPath(product.image),
        ...(product.gallery ?? []).map((item: unknown) => this.mediaPath(item)),
      ].filter(Boolean),
      category: {
        id: product.collection?.id ?? product.collectionId,
        name: product.collection?.translations?.[0]?.name ?? '',
      },
      pricing: {
        price: compareAtPrice || price,
        discount: {
          amount: Math.max(0, (compareAtPrice || price) - finalPrice),
          finalPrice,
          percentage:
            compareAtPrice > finalPrice ? Math.round(((compareAtPrice - finalPrice) / compareAtPrice) * 100) : 0,
        },
      },
      stock: Number(product.stock ?? variant?.stockQuantity ?? 0),
      hasVariation: Boolean(product.hasVariants),
      firstVariationId: variant?.id ?? null,
    };
  }

  private mediaPath(media: unknown): string | null {
    if (typeof media === 'string') return this.absoluteMediaPath(media);
    if (media && typeof media === 'object' && 'path' in media) {
      return this.absoluteMediaPath(String(media.path));
    }
    return null;
  }

  private absoluteMediaPath(path: string): string {
    if (!path.startsWith('/uploads')) return path;
    return `${process.env.APP_URL || 'http://localhost:3030'}${path}`;
  }
}
