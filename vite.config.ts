import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const entry = './src/index.ts'
export default defineConfig({
    plugins: [
        dts({
            entryRoot: 'src',
            outDir: ['dist'],
        }),
    ],
    build: {
        emptyOutDir: true,
        sourcemap: false,
        target: 'modules',
        outDir: 'dist',
        lib: {
            entry,
        },
        rollupOptions: {
            external: ['ofetch', 'query-string'],
            output: [
                {
                    format: 'es',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    exports: 'named',
                    dir: 'dist',
                    entryFileNames: () => {
                        return '[name].js'
                    },
                },
            ],
        },
    },
})
