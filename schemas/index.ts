import articleSidebarSlide from './articleSidebarSlide'
import author from './author'
import authorReview from './authorReview'
import blockContent from './blockContent'
import {
  faqSchema,
  htmlContentSchema,
  latexSchema,
  mediaFileSchema,
  stockVideoSchema,
} from './blockContent'
import category from './category'
import comment from './comment'
import contactMessage from './contactMessage'
import navigation from './navigation'
import newsletter from './newsletter'
import page from './page'
import post from './post'
import product from './product'
import series from './series'
import settings from './settings'
import tag from './tag'

export const schemaTypes = [
  // Documents
  post,
  author,
  authorReview,
  category,
  tag,
  product,
  series,
  page,
  navigation,
  comment,
  newsletter,
  settings,

  // Rich content building blocks (objects)
  blockContent,
  htmlContentSchema,
  stockVideoSchema,
  latexSchema,
  mediaFileSchema,
  faqSchema,
  articleSidebarSlide,
]

export const documentTypes = [
  'post',
  'author',
  'authorReview',
  'category',
  'tag',
  'product',
  'series',
  'page',
  'navigation',
  'comment',
  'contactMessage',
  'newsletter',
  'settings',
]
