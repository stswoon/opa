import { defineConfig } from 'vite'

export default defineConfig({
    define: {
        APP_VERSION: "0.1"
    },
    build: {
        sourcemap: true
    }
})
