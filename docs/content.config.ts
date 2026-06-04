import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { resolve } from 'pathe'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: {
        include: 'index.md',
      },
    }),
    examples: defineCollection({
      type: 'page',
      source: {
        cwd: resolve(__dirname, '../examples'),
        include: '**/README.md',
        prefix: '/examples',
        exclude: ['**/.**/**', '**/node_modules/**', '**/dist/**', '**/.docs/**'],
      },
      schema: z.object({
        category: z.string().optional(),
        icon: z.string().optional(),
        demo: z.string().optional(),
      }),
    }),
    releases: defineCollection({
      type: 'page',
      source: 'releases.yml',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        navigation: z.boolean().optional(),
        hero: z.object({
          title: z.string(),
          description: z.string(),
          hero: z.object({
            title: z.string(),
            description: z.string(),
            links: z.array().optional(),
          }),
        }),
      }),
    }),
  },
})
