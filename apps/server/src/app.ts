import fs from 'node:fs';
import path from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { ZodError } from 'zod';
import { MAX_UPLOAD_BYTES } from '@dsim/shared';
import { config, ensureDirectories } from './config';
import { AppError } from './lib/errors';
import { healthRoutes } from './routes/health';
import { settingsRoutes } from './routes/settings';
import { worldRoutes } from './routes/worlds';
import { characterRoutes } from './routes/characters';
import { assetRoutes } from './routes/assets';
import { conversationRoutes } from './routes/conversations';
import { shopRoutes } from './routes/shop';
import { propertyRoutes } from './routes/property';
import { marketRoutes } from './routes/market';
import { gamblingRoutes } from './routes/gambling';
import { minigameRoutes } from './routes/minigames';
import { playerRoutes } from './routes/player';
import { dataRoutes } from './routes/data';
import { phoneRoutes } from './routes/phone';
import { activityRoutes } from './routes/activities';
import './services/phone-bootstrap'; // registers world-clock → phone lifecycle hooks

export interface BuildAppOptions {
  logger?: boolean;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  ensureDirectories();

  const app = Fastify({
    logger: options.logger ?? true,
    bodyLimit: 64 * 1024 * 1024, // allow large import bundles
  });

  // CORS is intentionally permissive for LOCAL DEV only (explicit origin list).
  await app.register(cors, { origin: config.corsOrigins, credentials: true });

  await app.register(multipart, {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 10 },
  });

  // Serve uploaded assets from the controlled uploads directory only.
  await app.register(fastifyStatic, {
    root: config.uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
    index: false,
    list: false,
  });

  // Serve the built web client (apps/web/dist) when it exists, so the whole app
  // can run as a single process on a single port. In dev the folder is absent
  // and Vite serves the client, so this branch is simply skipped.
  const webEnabled = config.serveWeb && fs.existsSync(path.join(config.webDir, 'index.html'));
  if (webEnabled) {
    await app.register(fastifyStatic, {
      root: config.webDir,
      prefix: '/',
      index: ['index.html'],
      list: false,
      // Long-cache the fingerprinted assets Vite emits under /assets/.
      maxAge: '1y',
      immutable: true,
    });
  }

  app.setErrorHandler((err: Error & { statusCode?: number }, req, reply) => {
    if (err instanceof AppError) {
      reply.code(err.statusCode).send({ error: err.message, details: err.details });
      return;
    }
    if (err instanceof ZodError) {
      reply.code(400).send({ error: 'Validation failed.', details: err.flatten() });
      return;
    }
    const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;
    if (statusCode >= 500) req.log.error(err);
    reply.code(statusCode).send({ error: err.message || 'Internal server error.' });
  });

  await app.register(
    async (api) => {
      await healthRoutes(api);
      await settingsRoutes(api);
      await worldRoutes(api);
      await characterRoutes(api);
      await assetRoutes(api);
      await conversationRoutes(api);
      await shopRoutes(api);
      await propertyRoutes(api);
      await marketRoutes(api);
      await gamblingRoutes(api);
      await minigameRoutes(api);
      await playerRoutes(api);
      await phoneRoutes(api);
      await activityRoutes(api);
      await dataRoutes(api);
    },
    { prefix: '/api' },
  );

  // SPA deep-link fallback: any GET that isn't an API/uploads route or a real
  // static file falls back to index.html so client-side routes (e.g. /settings)
  // work on a hard refresh. API misses still return a JSON 404.
  if (webEnabled) {
    app.setNotFoundHandler((req, reply) => {
      if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
        return reply.type('text/html').sendFile('index.html');
      }
      reply.code(404).send({ error: 'Not found.' });
    });
  }

  return app;
}
