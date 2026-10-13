import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        streaming: resolve(__dirname, 'streaming.html'),
        vipGateway: resolve(__dirname, 'vip-gateway.html'),
        mixKitchen: resolve(__dirname, 'mix-kitchen-gateway.html'),
        codeChef: resolve(__dirname, 'code-chef.html'),
        tvGateway: resolve(__dirname, 'tv-gateway.html'),
        codeTv: resolve(__dirname, 'code-tv.html'),
        radioGateway: resolve(__dirname, 'radio-gateway.html'),
        codeRadio: resolve(__dirname, 'code-radio.html'),
        streamingGateway: resolve(__dirname, 'streaming-gateway.html'),
        codeStreaming: resolve(__dirname, 'code-streaming.html'),
        mixKitchenApp: resolve(__dirname, 'mix-kitchen.html'),
        mobileMixesGateway: resolve(__dirname, 'mobile-mixes-gateway.html'),
        mobileMixesGatewayV2: resolve(__dirname, 'mobile-mixes-gateway-v2.html'),
        page1: resolve(__dirname, 'page1-aug15-morning.html'),
        dimensionHub: resolve(__dirname, 'dimension-hub.html'),
        vaultGateway: resolve(__dirname, 'vault-gateway.html'),
        adminVault: resolve(__dirname, 'admin-vault.html')
      }
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    open: false
  }
});
