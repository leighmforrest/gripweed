import { glob } from "astro/loaders";
import { defineCollection } from "astro/content/config";
import { z } from "astro/zod";

const blog = defineCollection({
    loader: glob({
        pattern: "**/[^_]*.md",
        base: "./src/blog"
    }),
    schema: z.object({
        title: z.string(),
        pubDate:z.date(),
        author: z.string(),
        image: z.object({
            url: z.string(),
            alt: z.string()
        })
    })
})

export const collections = { blog }