import {defineConfig} from "vite"
import {createHtmlPlugin} from "vite-plugin-html"
import packageJson from "../package.json"

// const env = loadEnv(mode, process.cwd())
export default defineConfig({
    build: {
        sourcemap: true
    },
    css: {
        devSourcemap: true //todo seems not works https://github.com/vitejs/vite/issues/2830
    },
    plugins: [
        createHtmlPlugin({
            minify: false,
            inject: {
                data: {
                    APP_VERSION: packageJson.version,
                }
            }
        }),
    ]
});
