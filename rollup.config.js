import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import json from "rollup-plugin-json";
import { terser } from "rollup-plugin-terser";
import { scss } from "@kazzkiq/svelte-preprocess-scss";
import builtins from "rollup-plugin-node-builtins";
import replace from "rollup-plugin-replace";
import packagejson from "./package.json";

import autoPreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

// import visualizer from "rollup-plugin-visualizer";
import dayjs from "dayjs";
// import fs from "fs";

const { generateSW, injectManifest } = require("rollup-plugin-workbox");

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: "src/main.js",
    output: {
      sourcemap: false,
      format: "iife",
      name: "nomie",
      file: "public/bundle.js",
      globals: {},
      indent: false,
    },
    plugins: [
      builtins(),
      //
      replace({
        APP_VERSION: packagejson.version,
        APP_BRANCH: process.env.BRANCH,
        APP_URL: process.env.URL,
        APP_CONTEXT: process.env.CONTEXT,
        APP_BUILD_DATE: dayjs().format("ddd MMM D YYYY h:mma"),
      }),
      scss({
        input: "./scss/main.scss",
        output: function (styles, styleNodes) {
          writeFileSync("./public/main.css", styles);
        },
      }),
      svelte({
        // enable run-time checks when not in production
        dev: !production,
        preprocess: autoPreprocess(),
        // preprocess: {
        //   style: scss({ all: true }),
        // },
        // we'll extract any component CSS out into
        // a separate file — better for performance
        css: (css) => {
          css.write("public/bundle.css");
        },
      }),
      typescript({ sourceMap: !production }),
      json(),
      resolve(),
      commonjs({ sourceMap: false }),

      // generateSW({
      //   swDest: "./public/sw.js",
      //   globDirectory: "/glob",
      //   cleanupOutdatedCaches: true
      // }),

      // Remove Moe
      // visualizer(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload("public"),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: true,
    },
  },
  {
    input: "src/service-worker.js",
    output: {
      sourcemap: false,
      format: "cjs",
      file: "public/service-worker.js",
    },
    plugins: [
      builtins(),
      replace({
        APP_VERSION: packagejson.version,
        APP_BRANCH: process.env.BRANCH,
        APP_URL: process.env.URL,
        APP_SERVICE_URL: !production ? "http://localhost:8888" : "",
        APP_CONTEXT: process.env.CONTEXT,
        APP_BUILD_DATE: dayjs().format("ddd MMM D YYYY h:mma"),
      }),
    ],
  },
];
