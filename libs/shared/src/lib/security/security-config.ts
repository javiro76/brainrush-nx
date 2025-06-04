import helmet from 'helmet';
import { RequestHandler } from 'express';

interface SecurityConfigOptions {
  isPublic?: boolean;
  hasFrontend?: boolean;
  allowSwagger?: boolean;
}

export const securityConfigApp = (options: SecurityConfigOptions): RequestHandler[] => {
  const { isPublic = false, hasFrontend = false, allowSwagger = false } = options;
  const isProduction = process.env['NODE_ENV'] === 'production';

  // Configuración base común para todos los servicios
  const baseHelmet = helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    ...(isProduction && {
      strictTransportSecurity: {
        maxAge: 63072000, // 2 años
        includeSubDomains: true,
        preload: true,
      },
    }),
  });

  // Headers adicionales para todos los servicios
  const additionalHeaders: RequestHandler[] = [
    helmet.hidePoweredBy(),
    helmet.noSniff(),
    helmet.xssFilter(),
    (_, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      next();
    }
  ];

  // Configuración específica para servicios públicos con frontend
  if (isPublic && hasFrontend) {
    const cspDirectives = {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      ...(allowSwagger && {
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "validator.swagger.io"],
      }),
      ...(!allowSwagger && isProduction && {
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      }),
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    };

    const cspConfig = helmet.contentSecurityPolicy({
      directives: Object.fromEntries(
        Object.entries(cspDirectives).filter(([_, value]) => value !== null)
      ),
    });

    return [baseHelmet, cspConfig, ...additionalHeaders];
  }

  // Configuración mínima para servicios internos
  return [
    baseHelmet,
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"]
      },
    }),
    ...additionalHeaders
  ];
};
