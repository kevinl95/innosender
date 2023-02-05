import { html } from '../lib/utils.ts';

export default function header(currentPath: string) {
  return html`
    <header>
      <h1>
        <a href="/">
          <img alt="Logo: Segments of a linked chain with the word InnoSender underneath." src="/public/images/logo.svg" width="240" />
        </a>
      </h1>
      <nav>
        <ul>
          <li class="${currentPath === '/fiat-onramp' ? 'active' : ''}">
            <a href="/fiat-onramp">
              Fiat Onramp
            </a>
          </li>
          <li class="${currentPath === '/about' ? 'active' : ''}">
            <a href="/about">
              About
            </a>
          </li>
          <li class="${currentPath === '/privacy' ? 'active' : ''}">
            <a href="/privacy">
              Privacy Policy
            </a>
          </li>
        </ul>
      </nav>
    </header>
  `;
}
