import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    server: {
        port: 3003,
    },
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            // Compat shim — components still `import { addPropertyControls, ControlType, motion } from "framer"`.
            // addPropertyControls is now a no-op; will be stripped during Next.js migration.
            framer: "/dev/framer-stub.ts",
        },
    },
})
