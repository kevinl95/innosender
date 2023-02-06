import { basicLayoutResponse, escapeHtml, html, PageContentResult } from '../lib/utils.ts';
import Stealth from "https://esm.sh/stealth@0.4.0"
import * as solanaWeb3 from "https://esm.sh/@solana/web3.js@1.73.2"
import bs58 from "https://esm.sh/bs58@5.0.0"
const titlePrefix = 'InnoSender';

export async function pageAction(request: Request, match: URLPatternResult) {
  if (request.method !== 'POST') {
    return new Response('Not Implemented', { status: 501 });
  }

  let errorMessage = '';
  let submittedAddress = '';
  let senderAddress = '';
  let nftContent = '';
  let nftName = ''
  let successMessage = '';
  const formData = await request.formData();
  try {
    console.log(formData);
    submittedAddress = (formData.get('address-value') as string).trim();
    console.log(submittedAddress);
    senderAddress = (formData.get('youraddress-value') as string).trim();
    nftContent = (formData.get('content-value') as string).trim();
    nftName = (formData.get('name-value') as string).trim();
    if (!submittedAddress) {
      throw new Error('An address is required');
    }
    if (!senderAddress) {
      throw new Error('Your wallet address is required');
    }
    if (!nftName) {
      throw new Error('A name is required');
    }
    if (!nftContent) {
      nftContent = "An NFT from InnoSender.com!"
    }
  } catch (error) {
    errorMessage = error.toString();
  }

  var stealth = Stealth.fromString(submittedAddress);
  
  // single-use nonce key pair
  var keypair = solanaWeb3.Keypair.generate();
  
  // generate payment address
  var payToAddress = stealth.genPaymentAddress(keypair.secretKey);

  try {
    console.log("Pass")
  } catch (error) {
    //errorMessage = "Invalid address! Check your input and try again."
    errorMessage = error;
  }

  var myHeaders = new Headers();
  myHeaders.append("x-api-key", "");
  var imageData = formData.get('image-value');
  if (!imageData) {
    imageData = "";
  }
  var formdata = new FormData();
  formdata.append("network", "devnet");
  formdata.append("creator_wallet", submittedAddress);
  formdata.append("name", nftName);
  formdata.append("symbol", "P2");
  formdata.append("description", nftContent);
  formdata.append("max_supply", "1");
  formdata.append("receiver", payToAddress);
  formdata.append("image", imageData, nftName + ".jpeg");
  formdata.append("fee_payer", senderAddress);

  let res = "";
  fetch("https://api.shyft.to/sol/v2/nft/create", {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  }).then(response => response.text())
    .then(result => res=result)
    .catch(error => errorMessage = errorMessage + error);

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
      <p>Your encoded transaction! "${escapeHtml(res)}" successfully.</p>
    </section>
  `
    : '';

  const htmlContent = generateHtmlContent(errorHtml || successHtml, errorMessage ? submittedAddress : '');

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

function generateHtmlContent(notificationHtml = '', addressValue = '', senderAddress = '', content = '', name = '') {
  const htmlContent = html`
    <section class="main-section">
      ${notificationHtml}
      <h1 class="main-title">
        InnoSender is a service that lets you mint Solana NFTs for an anonymous wallet (and in the future transfer currency and tokens) without making it public that you made them! Further, it uses the unique features of Solana to allow you to transfer the new asset to a wallet that has no SOL or other currency inside- your wallet you are transfering from will pay the gas fee on the behalf of the receiving wallet. This solves a major issue with using stealth addresses to bootstrap a new, anonymous wallet.
      </h1>
      <p>We recommend you visit this page via Tor. This page has been optimized for Tor users using CloudFlare.</p>
      <p><a href="https://blog.cloudflare.com/cloudflare-onion-service/">You can find out more about using CloudFlare's onion service here.</p>
      <p><a href="https://vitalik.ca/general/2023/01/20/stealth.html">You can read more about stealth addresses, their history, and how they work in a recent block post by Vitalki Buterin.</a> The gist is we will be generating one-time use addresses, and using cryptography to hide your public key.</p>
      <p>
        There are two steps to securely transfer your NFT asset. The receiver, be it you or someone else, must first complete this section. If you are trying to send an asset, scroll to the next section.
      </p>
      <h1>Receiver Setup</h1>
      <p>When this button is pressed InnoSender will generate two sets of keypairs that will be downloaded to your machine and can be used to create your new anonymous wallet. Keep them safe! You will also get an address you should give to the person sending you an NFT, preferably using an encrypted app such as Signal or by handing them the address in person.</p>
      <p>You will use the "Scan" key to check if the sender has minted their NFT and made it available to you.</p>
      <button is="app-button">
        Click me to get your stealth address and keys!
      </button>
      <h1>Sender Setup</h1>
      <form action="/" method="POST" enctype=multipart/form-data>
        <fieldset>
          <label for="address">Address from Receiver</label>
          <input id="address-value" name="address-value" type="text" placeholder="Get this from the receiver!" value="${
    escapeHtml(addressValue)
  }" />
        </fieldset>
        <fieldset>
          <label for="address">Your Wallet Address (must have some SOL to pay the gas fees)</label>
          <input id="youraddress-value" name="youraddress-value" type="text" placeholder="" value="${
    escapeHtml(senderAddress)
  }" />
        </fieldset>
        <fieldset>
          <label for="address">NFT name</label>
          <input id="name-value" name="name-value" type="text" placeholder="" value="${
    escapeHtml(name)
  }" />
        </fieldset>
        <fieldset>
          <label for="address">NFT Description (an external URL, a secret message, etc.)</label>
          <input id="content-value" name="content-value" type="text" placeholder="" value="${
    escapeHtml(content)
  }" />
        </fieldset>
        <fieldset>
        <label for="image">NFT image</label>
        <input id="image-value" name="image-value" type="file" accept="image/jpeg"/>
        </fieldset> 
        <button type="submit">Submit</button>
      </form>
    </section>
    <script src="/public/ts/web-component.ts" type="module" defer></script>
  `;

  return htmlContent;
}

