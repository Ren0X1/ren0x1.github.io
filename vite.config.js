import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base '/' for username.github.io repos
  // Change to '/repo-name/' only if using a project repo (e.g. github.com/user/repo-name)
  base: '/',
})
