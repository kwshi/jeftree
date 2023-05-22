import { vitePreprocess } from "@sveltejs/kit/vite";

import adapterNetlify from "@sveltejs/adapter-netlify";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: { dev: true },
  kit: {
    adapter: adapterNetlify(),
    //adapter: adapterStatic({
    //  pages: "build",
    //  assets: "build",
    //}),
  },
};

export default config;
