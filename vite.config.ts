import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Vite plugin to execute server API routes directly in development
function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        try {
          // Dynamic import of the routes handler to support hot reload & tsx
          const { handleApiRoute } = await server.ssrLoadModule('./server/api/routes.ts');

          // Collect request body
          let body: any = undefined;
          if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch {
                body = rawBody;
              }
            }
          }

          const response = await handleApiRoute({
            method: req.method || 'GET',
            url: req.url,
            body,
            headers: req.headers as any,
          });

          res.statusCode = response.statusCode;
          res.setHeader('Content-Type', 'application/json');

          if (response.headers) {
            for (const [key, value] of Object.entries(response.headers)) {
              res.setHeader(key, value);
            }
          }

          res.end(JSON.stringify(response.body));
        } catch (err: any) {
          console.error('API Middleware Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), apiDevServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, './server'),
      '@db': path.resolve(__dirname, './db'),
    },
  },
  server: {
    port: 3000,
  },
})
