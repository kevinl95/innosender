import { createRequire } from "https://deno.land/std/node/module.ts";
import { basicLayoutResponse, escapeHtml, html, PageContentResult } from '../lib/utils.ts';
const require = createRequire(import.meta.url);
const stealth = require("../node_modules/stealth");
const titlePrefix = 'InnoSender';

export async function pageAction(request: Request, match: URLPatternResult) {
  if (request.method !== 'POST') {
    return new Response('Not Implemented', { status: 501 });
  }

  let errorMessage = '';
  let submittedRandomValue = '';

  try {
    const formData = await request.formData();
    submittedRandomValue = (formData.get('random-value') as string).toLocaleLowerCase().trim();

    if (!submittedRandomValue) {
      throw new Error('A random value is required');
    }

    if (!submittedRandomValue.includes('something')) {
      throw new Error('The random value needs to have "something" in it');
    }
  } catch (error) {
    errorMessage = error.toString();
  }

  const errorHtml = errorMessage
    ? html`
    <section class="error">
      <h3>Error!</h3>
      <p>${errorMessage}</p>
    </section>
  `
    : '';
  const successHtml = !errorMessage
    ? html`
    <section class="success">
      <h3>Success!</h3>
      <p>You submitted "${escapeHtml(submittedRandomValue)}" successfully.</p>
    </section>
  `
    : '';

  const htmlContent = generateHtmlContent(errorHtml || successHtml, errorMessage ? submittedRandomValue : '');

  return basicLayoutResponse(htmlContent, {
    currentPath: match.pathname.input,
    titlePrefix,
  });
}

export function pageContent() {
  const htmlContent = generateHtmlContent();

  return {
    htmlContent,
    titlePrefix,
  } as PageContentResult;
}

function generateHtmlContent(notificationHtml = '', randomValue = '') {
  const htmlContent = html`
    <section class="main-section">
      <h1 class="main-title">
        InnoSender is a service that lets you transfer Solana NFTs (and in the future currency and tokens) without making it public that you sent them! Further, it uses the unique features of Solana to allow you to transfer to a wallet that has no SOL or other currency inside- your wallet you are transfering from will pay the gas fee on the behalf of the receiving wallet. This solves a major issue with using stealth addresses to bootstrap a new, anonymous wallet.
      </h1>
      <p>We recommend you visit this page via Tor. This page has been optimized for Tor users using CloudFlare.</p>
      <p><a href="https://blog.cloudflare.com/cloudflare-onion-service/">You can find out more about using CloudFlare's onion service here.</p>
      <p><a href="https://vitalik.ca/general/2023/01/20/stealth.html">You can read more about stealth addresses, their history, and how they work in a recent block post by Vitalki Buterin.</a> The gist is we will be generating one-time use addresses, and using cryptography to hide your public key.</p>
      ${notificationHtml}
      <p>
        There are two steps to securely transfer your NFT asset. The receiver, be it you or someone else, must first complete this section. If you are trying to send an asset, scroll to the next section.
      </p>
      <h1>Receiver Setup</h1>
      <form action="/form" method="POST">
        <fieldset>
          <label for="random-value">Random Value</label>
          <input id="random-value" name="random-value" type="text" placeholder="something" value="${
    escapeHtml(randomValue)
  }" />
        </fieldset>
        <button type="submit">Submit</button>
      </form>
      <h1>Sender Setup</h1>
    </section>
  `;

  return htmlContent;
}

