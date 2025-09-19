// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/color-mode'
  ],

  // NuxtUI configuration
  ui: {
    global: true,
    icons: ['heroicons']
  },

  // ColorMode configuration - force light mode
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  // TypeScript configuration
  typescript: {
    strict: true
  },

  // CSS configuration
  css: [
    '~/assets/scss/main.scss'
  ],

  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "~/assets/scss/abstracts/_variables.scss";'
        }
      }
    }
  },

  // Google Fonts
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      'JetBrains Mono': [400, 500]
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api'
    }
  },

  // Development server
  devServer: {
    port: 3000
  },

  // Build configuration
  build: {
    transpile: ['@headlessui/vue']
  }
})
