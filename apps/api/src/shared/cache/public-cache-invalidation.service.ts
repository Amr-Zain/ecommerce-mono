import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CacheService } from './cache.service';
import { publicCacheTags } from './cache-tags';

const PUBLIC_CACHE_INVALIDATE_EVENT = 'cache.public.invalidate';

export const PUBLIC_CACHE_EVENTS = {
  productsChanged: 'products.changed',
  collectionsChanged: 'collections.changed',
  slidersChanged: 'sliders.changed',
  faqsChanged: 'faqs.changed',
  locationsChanged: 'locations.changed',
  attributesChanged: 'attributes.changed',
  staticPagesChanged: 'static-pages.changed',
  showRoomsChanged: 'showrooms.changed',
  reviewsChanged: 'reviews.changed',
  settingsChanged: 'settings.changed',
} as const;

export type PublicCacheEvent = (typeof PUBLIC_CACHE_EVENTS)[keyof typeof PUBLIC_CACHE_EVENTS];

type PublicCacheEventPayload = {
  productId?: string | number | bigint;
};

type PublicCacheInvalidationPayload = {
  event: PublicCacheEvent;
  tags: string[];
};

@Injectable()
export class PublicCacheInvalidationPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(event: PublicCacheEvent, payload: PublicCacheEventPayload = {}) {
    this.eventEmitter.emit(PUBLIC_CACHE_INVALIDATE_EVENT, {
      event,
      tags: Array.from(new Set(resolvePublicCacheTags(event, payload))),
    } satisfies PublicCacheInvalidationPayload);
  }
}

function resolvePublicCacheTags(event: PublicCacheEvent, payload: PublicCacheEventPayload): string[] {
  switch (event) {
    case PUBLIC_CACHE_EVENTS.productsChanged:
      return withOptionalProductTag(
        [publicCacheTags.products, publicCacheTags.home, publicCacheTags.collections],
        payload.productId,
      );
    case PUBLIC_CACHE_EVENTS.collectionsChanged:
      return [publicCacheTags.collections, publicCacheTags.products, publicCacheTags.home];
    case PUBLIC_CACHE_EVENTS.slidersChanged:
      return [publicCacheTags.sliders, publicCacheTags.home];
    case PUBLIC_CACHE_EVENTS.faqsChanged:
      return [publicCacheTags.faqs];
    case PUBLIC_CACHE_EVENTS.locationsChanged:
      return [publicCacheTags.countries, publicCacheTags.cities];
    case PUBLIC_CACHE_EVENTS.attributesChanged:
      return [publicCacheTags.attributes, publicCacheTags.products];
    case PUBLIC_CACHE_EVENTS.staticPagesChanged:
      return [publicCacheTags.staticPages];
    case PUBLIC_CACHE_EVENTS.showRoomsChanged:
      return [publicCacheTags.showRooms, publicCacheTags.home];
    case PUBLIC_CACHE_EVENTS.reviewsChanged:
      return payload.productId === undefined
        ? [publicCacheTags.products]
        : [
            publicCacheTags.products,
            publicCacheTags.product(payload.productId),
            publicCacheTags.reviews(payload.productId),
          ];
    case PUBLIC_CACHE_EVENTS.settingsChanged:
      return [publicCacheTags.settings, publicCacheTags.home];
  }
}

function withOptionalProductTag(tags: string[], productId?: string | number | bigint): string[] {
  return productId === undefined ? tags : [...tags, publicCacheTags.product(productId)];
}

@Injectable()
export class PublicCacheInvalidationListener {
  private readonly logger = new Logger(PublicCacheInvalidationListener.name);

  constructor(private readonly cache: CacheService) {}

  @OnEvent(PUBLIC_CACHE_INVALIDATE_EVENT, { async: true, suppressErrors: true })
  async handle(payload: PublicCacheInvalidationPayload) {
    await this.cache.invalidateTags(payload.tags);
    this.logger.debug(`Invalidated public cache for ${payload.event}`);
  }
}
