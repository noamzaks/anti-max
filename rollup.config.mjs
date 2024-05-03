import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import nodeResolve from "@rollup/plugin-node-resolve"

export default {
  input: "index.js",
  output: {
    file: "anti-max.js",
    format: "cjs",
    strict: false,
    inlineDynamicImports: true,
  },
  plugins: [json(), commonjs(), nodeResolve()],
}
