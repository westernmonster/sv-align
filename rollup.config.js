import svelte from "rollup-plugin-svelte"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import serve from "rollup-plugin-serve"
import html2 from "rollup-plugin-html2"
// import typescript from "rollup-plugin-typescript2";
// import tscompile from "typescript";
import { terser } from "rollup-plugin-terser"
import livereload from "rollup-plugin-livereload"
import bundleSize from "rollup-plugin-bundle-size"
import babel from "rollup-plugin-babel"
import sveltePreprocess from "svelte-preprocess"
import pkg from "./package.json"

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, "$3")
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase())

const isProd = process.env.NODE_ENV === "production"
const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"

const preprocess = sveltePreprocess({
  scss: {
    includePaths: ["src"]
  },
  postcss: {
    plugins: [require("autoprefixer")]
  }
})

const plugins = [
  commonjs({ include: "node_modules/**" }),
  // typescript({ typescript: tscompile }),
  svelte({
    dev: isProd ? false : true,
    extensions: [".svelte"],
    // preprocess: require("./svelte.config.js").preprocess,
    preprocess,
    css: isTest ? false : css => css.write("build/style.css")
  }),
  resolve({
    browser: true,
    dedupe: importee => importee === "svelte" || importee.startsWith("svelte/")
  }),
  html2({
    template: "src/index.html",
    fileName: "index.html",
  })
]

if (isDev) {
  plugins.push(
    serve({
      open: false,
      openPage: "/index.html",
      historyApiFallback: "/index.html",
      contentBase: ["./build"]
    }),
    livereload({
      watch: "build"
    })
  )
} else if (isProd) {
  // Minify
  plugins.push(terser({  mangle: true }))
  plugins.push(
    babel({
      extensions: [".js", ".mjs", ".svelte"],
      include: ["src/**"],
      exclude: ["node_modules/**"],
      runtimeHelpers: true
    })
  )
}

plugins.push(bundleSize())

export default {
  input: isProd ? "src/align/index.js" : "src/index.js",
  output: [
    { file: pkg.module, format: "es" },
    { file: pkg.main, format: "umd", name }
  ],
  plugins
}