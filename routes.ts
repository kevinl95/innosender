import { serveFile } from 'std/http/file_server.ts';
import {
  basicLayoutResponse,
  PageContentResult,
  serveFileWithSass,
  serveFileWithTs,
} from './lib/utils.ts';
import Stealth from "https://esm.sh/stealth@0.4.0"
import * as solanaWeb3 from "https://esm.sh/@solana/web3.js@1.73.2"
import bs58 from "https://esm.sh/bs58@5.0.0"
// NOTE: This won't be necessary once https://github.com/denoland/deploy_feedback/issues/1 is closed
import * as indexPage from './pages/index.ts';
import * as aboutPage from './pages/about.ts';
import * as privacyPage from './pages/privacy.ts';
const pages = {
  index: indexPage,
  about: aboutPage,
  privacy: privacyPage,
};

export interface Route {
  pattern: URLPattern;
  handler: (
    request: Request,
    match: URLPatternResult,
  ) => Response | Promise<Response>;
}

interface Routes {
  [routeKey: string]: Route;
}

function createBasicRouteHandler(id: string, pathname: string) {
  return {
    pattern: new URLPattern({ pathname }),
    handler: async (request: Request, match: URLPatternResult) => {
      try {
        // NOTE: Use this instead once https://github.com/denoland/deploy_feedback/issues/1 is closed
        // const { pageContent } = await import(`./pages/${id}.ts`);

        // @ts-ignore necessary because of the comment above
        const { pageContent, pageAction } = pages[id];

        if (request.method !== 'GET') {
          return pageAction(request, match) as Response;
        }

        const pageContentResult = await pageContent(request, match);

        if (pageContentResult instanceof Response) {
          return pageContentResult;
        }

        const { htmlContent: htmlContent, titlePrefix } = (pageContentResult as PageContentResult);

        return basicLayoutResponse(htmlContent, { currentPath: match.pathname.input, titlePrefix });
      } catch (error) {
        if (error.toString().includes('NotFound')) {
          return new Response('Not Found', { status: 404 });
        }

        console.error(error);

        return new Response('Internal Server Error', { status: 500 });
      }
    },
  };
}

const routes: Routes = {
  sitemap: {
    pattern: new URLPattern({ pathname: '/sitemap.xml' }),
    handler: async (_request) => {
      const fileContents = await Deno.readTextFile(`public/sitemap.xml`);

      const oneDayInSeconds = 24 * 60 * 60;

      return new Response(fileContents, {
        headers: {
          'content-type': 'application/xml; charset=utf-8',
          'cache-control': `max-age=${oneDayInSeconds}, public`,
        },
      });
    },
  },
  robots: {
    pattern: new URLPattern({ pathname: '/robots.txt' }),
    handler: async (_request) => {
      const fileContents = await Deno.readTextFile(`public/robots.txt`);

      const oneDayInSeconds = 24 * 60 * 60;

      return new Response(fileContents, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': `max-age=${oneDayInSeconds}, public`,
        },
      });
    },
  },
  public: {
    pattern: new URLPattern({ pathname: '/public/:filePath*' }),
    handler: (request, match) => {
      const { filePath } = match.pathname.groups;

      try {
        const fullFilePath = `public/${filePath}`;

        const fileExtension = filePath.split('.').pop()?.toLowerCase();

        if (fileExtension === 'ts') {
          return serveFileWithTs(request, fullFilePath);
        } else if (fileExtension === 'scss') {
          return serveFileWithSass(request, fullFilePath);
        }

        return serveFile(request, fullFilePath);
      } catch (error) {
        if (error.toString().includes('NotFound')) {
          return new Response('Not Found', { status: 404 });
        }
        isBuffer
        console.error(error);

        return new Response('Internal Server Error', { status: 500 });
      }
    },
  },
  index: createBasicRouteHandler('index', '/'),
  about: createBasicRouteHandler('about', '/about'),
  privacy: createBasicRouteHandler('privacy', '/privacy'),
  api_v0_handle_receiver: {
    pattern: new URLPattern({ pathname: '/api/v0/handle-receiver' }),
    handler: (_request) => {
      var payloadWallet = solanaWeb3.Keypair.generate();
      var scanWallet = solanaWeb3.Keypair.generate();
      var stealth = new Stealth({
        payloadPrivKey: payloadWallet.secretKey.slice(0, 32),
        payloadPubKey: payloadWallet.publicKey.toBuffer(),
        scanPrivKey: scanWallet.secretKey.slice(0, 32),
        scanPubKey: scanWallet.publicKey.toBuffer()
      });
      var addr = stealth.toString();
      var friendlyPayPriv = bs58.encode(payloadWallet.secretKey);
      var friendlyScanPriv = bs58.encode(scanWallet.secretKey)
      return new Response(JSON.stringify({ "addr": addr, "payloadPriv": friendlyPayPriv, "payloadPub": payloadWallet.publicKey, "scanPriv": friendlyScanPriv, "scanPub": scanWallet.publicKey }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      });
    },
  },
};

export default routes;
