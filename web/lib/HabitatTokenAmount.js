import {
  renderAmount,
  getTokenV2,
  getEtherscanTokenLink,
} from './utils.js';

const TEMPLATE =
`
<style>
habitat-token-amount img {
  height: 1em;
  width: 1em;
  margin-right: .3em;
}
</style>
<a target='_blank' class='flex row'>
<img>
<span></span>
</a>
`;
const ATTR_TOKEN = 'token';
const ATTR_OWNER = 'owner';
const ATTR_AMOUNT = 'amount';

export default class HabitatTokenAmount extends HTMLElement {
  static get observedAttributes() {
    return [ATTR_TOKEN, ATTR_OWNER, ATTR_AMOUNT];
  }

  constructor() {
    super();
  }

  connectedCallback () {
  }

  disconnectedCallback () {
  }

  adoptedCallback () {
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (!this.children.length) {
      this.innerHTML = TEMPLATE;
    }
    return this.update();
  }

  async update () {
    const token = await getTokenV2(this.getAttribute(ATTR_TOKEN));
    const owner = this.getAttribute(ATTR_OWNER);
    const value = this.getAttribute(ATTR_AMOUNT) || '0';

    this.children[1].href = getEtherscanTokenLink(token.address, owner);
    this.children[1].children[0].src = token.logoURI;
    this.children[1].children[1].textContent = `${renderAmount(value, token.decimals)} ${token.symbol}`;
  }
}

customElements.define('habitat-token-amount', HabitatTokenAmount);
