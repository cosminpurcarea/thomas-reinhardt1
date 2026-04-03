import { defineConfig } from "sanity";
import { article } from "./schemas/article";
import { product } from "./schemas/product";

export default defineConfig({
  name: "default",
  title: "Thomas Reinhardt Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "abcde12345fghij67890",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/admin",
  schema: {
    types: [article, product],
  },
});

