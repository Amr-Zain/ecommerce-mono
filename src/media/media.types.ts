import { MediaType } from './enums/media-type.enum';

/**
 * Configuration for a single media slot on an entity.
 * Each slot represents a specific purpose (e.g., "avatar", "flag", "gallery").
 */
export interface MediaSlotConfig {
  /** The collection key stored in the DB (e.g., "avatar", "flag", "gallery") */
  collection: string;
  /** If true, only one file allowed — response returns an object (or null). If false, returns an array. */
  single: boolean;
  /** Restrict to these media types. If empty/undefined, all types are allowed. */
  allowedTypes?: MediaType[];
}

/**
 * A media record as returned in API responses.
 */
export interface MediaRecord {
  uuid: string;
  isMain: boolean;
  path: string;
  originalName: string;
  mimeType: string;
  type: string;
  size: number;
  collection: string;
}

/**
 * Default select fields for media queries — keeps responses lean.
 */
export const MEDIA_SELECT = {
  uuid: true,
  isMain: true,
  path: true,
  originalName: true,
  mimeType: true,
  type: true,
  size: true,
  collection: true,
} as const;
