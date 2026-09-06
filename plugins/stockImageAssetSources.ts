import { ImageIcon } from '@sanity/icons'
import type { AssetSource } from 'sanity'

import StockImageAssetSource from '@/components/studio/StockImageAssetSource'

export const stockImageAssetSources: AssetSource[] = [
  {
    name: 'pexels-pixabay',
    title: 'Pexels + Pixabay',
    icon: ImageIcon,
    component: StockImageAssetSource,
  },
]
