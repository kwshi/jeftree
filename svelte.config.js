import preprocess from "svelte-preprocess";

import adapterNetlify from "@sveltejs/adapter-netlify";
//import adapterStatic from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({ postcss: true }),
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
