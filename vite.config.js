import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import linaria from '@linaria/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    linaria({
      include: ['**/*.{js,jsx,ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-react'],
      },
    }),
  ],
})
