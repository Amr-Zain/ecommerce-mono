import { Image } from "./general";

type LocalizedBlock = { title?: string | null; content?: string | null }

export type AdditionalPage = {
  id: number
  title: string | null
  content: string | null
  image?: Image | null
  is_active: boolean
  created_at: string
  sort_order?: number
  en?: LocalizedBlock
  ar?: LocalizedBlock
  static_page?: {
    id: number
    slug: string
    title: string
    image: string | null
    content: string | null
    is_active: boolean
    created_at: string
  }
}

export type StaticPage = {
  id: number
  slug: string
  title: string | null
  content: string | null
  image?: Image | null
  is_active: boolean
  created_at: string
  en?: LocalizedBlock
  ar?: LocalizedBlock
  sections?: AdditionalPage[]
}
