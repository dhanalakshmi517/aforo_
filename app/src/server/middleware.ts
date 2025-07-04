import cors from 'cors';
import express from 'express';

// NOTE: Make sure you have the 'cors' package installed! `npm i cors`
// This is the middleware configuration for the server.
// It is used to configure the server to use the cors middleware.
// It is also used to configure the server to parse the request body as JSON.

// The server setup function is a function that receives the express app and returns it after applying middleware.
export const serverSetup = (app: express.Express) => {
  // Check if the environment is development or production and set the origin accordingly
  const origin = process.env.NODE_ENV === 'production' ? process.env.WASP_WEB_CLIENT_URL : 'http://localhost:3000';

  app.use(
    cors({
      origin: origin,
      credentials: true,
    })
  );
  app.use(express.json());
  return app;
};
