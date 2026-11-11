import { defineConfig, loadEnv } from 'vite';
import handler from './api/ask.js';
import recommendHandler from './api/recommend.js';

export default defineConfig(({ mode }) => ({
  esbuild: { jsx: 'automatic' },
  plugins: [{
    name: 'local-ai-api',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');
      for (const key of ['OPENAI_API_KEY', 'OPENAI_EMBED_MODEL', 'OPENAI_CHAT_MODEL', 'AI_TOP_K', 'AI_MIN_SCORE', 'AI_RATE_LIMIT_PER_MIN']) if (env[key]) process.env[key] ||= env[key];
      // Vercel 서버리스 함수(api/*.js)를 로컬 dev 서버에서도 같은 req/res 모양으로 돌린다.
      const mount = (path, fn) => server.middlewares.use(path, async (req, res) => {
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 2048) { res.writeHead(413).end(); return; }
        }
        req.body = body;
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (value) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
        await fn(req, res);
      });
      mount('/api/ask', handler);
      mount('/api/recommend', recommendHandler);
    },
  }],
}));
