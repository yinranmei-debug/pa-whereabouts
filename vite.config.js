import { defineConfig } from 'vite' // 👈 就是少了这一行！
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 确保这个还在，对上传 SharePoint 至关重要
})