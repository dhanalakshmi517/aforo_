import cors from 'cors';
import express from 'express';

// Lightweight alias so we don't require the full 'fastify' types in projects that use Express only.
type FastifyLike = {
  register?: (...args: any[]) => any;
};

// NOTE: Make sure you have the 'cors' package installed! `npm i cors`
// This is the middleware configuration for the server.
// It is used to configure the server to use the cors middleware.
// It is also used to configure the server to parse the request body as JSON.

// The server setup function is a function that receives the express app and returns it after applying middleware.
export const serverSetup = (app: express.Express | FastifyLike) => {
  const origin = process.env.NODE_ENV === 'production'
    ? process.env.WASP_WEB_CLIENT_URL
    : 'http://localhost:3000';

  // If the framework exposes `.use`, assume Express
  if (typeof (app as any).use === 'function') {
    (app as any).use(cors({ origin, credentials: true }));
    (app as any).use(express.json());
    return app;
  }

  // If the framework exposes `.register`, assume Fastify
  if (typeof (app as any).register === 'function') {
    try {
      // Dynamically import to avoid type errors if dependency not present
      const fastifyCors = require('@fastify/cors');
      (app as any).register(fastifyCors, { origin, credentials: true });
    } catch (err) {
      console.error('CORS middleware for Fastify not installed. Run `npm i @fastify/cors`');
    }
    return app;
  }

  console.warn('serverSetup: Unknown server instance – CORS not enabled');
  return app;
};
