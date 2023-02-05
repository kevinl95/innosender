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
          <li class="${currentPath === '/' ? 'active' : ''}">
            <a href="/">
              Home
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
