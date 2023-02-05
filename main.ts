import { serve } from 'std/http/server.ts';
import routes, { Route } from './routes.ts';
import { createRequire } from "https://deno.land/std/node/module.ts";

const require = createRequire(import.meta.url);
const stealth = require("stealth");

function handler(request: Request) {
  const routeKeys = Object.keys(routes);

  for (const routeKey of routeKeys) {
    const route: Route = routes[routeKey];
    const match = route.pattern.exec(request.url);

    if (match) {
      return route.handler(request, match);
    }
  }

  return new Response('Not Found', {
    status: 404,
  });
}

export const abortController = new AbortController();

const PORT = Deno.env.get('PORT') || 8000;

serve(handler, { port: PORT as number, signal: abortController.signal });
