import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
    // Charge le fichier .env en fonction du mode (ex: .env.development)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    // Utilisation de la variable d'environnement pour l'URL cible
                    target: env.VITE_API_TARGET || 'http://localhost:80/Eval-prestashop',
                    headers: {
                        // Utilisation de la clé API stockée dans le .env
                        Authorization: `Basic ${btoa(env.VITE_PRESTASHOP_KEY + ':')}`
                    },
                    changeOrigin: true,
                }
            }
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    };
});