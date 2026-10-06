import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ephemeralSecurityHeaders } from './middleware/security.js';
import analyzeRouter from './routes/analyze.js';
import verifyRouter from './routes/verify.js';
import reportingRouter from './routes/reporting.js';

export function createServer(): Express {
  const app = express();

  // Basic security hardening
  app.use(helmet({
    contentSecurityPolicy: false, // For easier dev setup
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: '*', // Prototype allows all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Body parsing with limits
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Ephemeral storage and zero-cache privacy middleware
  app.use(ephemeralSecurityHeaders);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'Chaukanna Bharat Verification API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  // Mount API modular routers
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/verify', verifyRouter);
  app.use('/api/report', reportingRouter);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Global Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]:', err.message);
    res.status(500).json({
      error: 'Internal verification pipeline error',
      message: err.message,
    });
  });

  return app;
}
