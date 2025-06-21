import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Pozwala na dostęp z innych urządzeń w sieci lokalnej
    port: 5173, // Domyślny port Vite
  }
})
