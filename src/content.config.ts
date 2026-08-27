import { glob } from "astro/loaders";
import { defineCollection } from "astro/content/config";
import { z } from "astro/zod";
import { image } from "astro:content";

const blog = defineCollection({
    loader: glob({
        pattern: "**/[^_]*.md",
        base: "./src/blog"
    }),
    schema: ({ image }) => z.object({
        title: z.string(),
        pubDate:z.date(),
        author: z.string(),
        image: image(),
        altText: z.string()
    })
})

export const collections = { blog }