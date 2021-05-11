import {
  walletIsConnected,
  getSigner,
  _getTokenCached,
  renderAmount,
  ethers,
  wrapListener,
} from './utils.js';
import {
  getProviders,
  doQuery,
  getProposalInformation,
  getCommunityInformation,
  queryTransactionHashForProposal,
  fetchLatestVote,
  submitVote,
} from './rollup.js';

import './slider.js';
import './HabitatCircle.js';

const TEMPLATE =
`
<div class='listitem'>
  <space></space>
  <div class='flex col evenly' style='width:20ch;max-width:100%;'>
    <p class='bold' id='title'> </p>
    <p class='' id='community'> </p>
    <space></space>
    <habitat-circle></habitat-circle>
    <space></space>
    <label>
      Tap or Drag the slider to adjust the stake
      <habitat-slider></habitat-slider>
    </label>
    <div class='flex'>
      <button id='vote' class='smaller purple'>Change</button>
      <a id='link' target='_blank' class='button secondary smaller'>View Proposal</a>
    </div>
  </div>
  <space></space>
</div>`;


const ATTR_PROPOSAL = 'x-proposal';
const ATTR_SHARES = 'x-shares';
const ATTR_SIGNAL = 'x-signal';

export default class HabitatStake extends HTMLElement {
  static get observedAttributes() {
    return [ATTR_PROPOSAL, ATTR_SHARES];
  }

  constructor() {
    super();
  }

  connectedCallback () {
    if (!this.children.length) {
      this.innerHTML = TEMPLATE;
    }
  }

  disconnectedCallback () {
  }

  adoptedCallback () {
  }

  attributeChangedCallback (name, oldValue, newValue) {
    return this.update();
  }

  async update () {
    const proposalId = this.getAttribute(ATTR_PROPOSAL);
    const txHash = await queryTransactionHashForProposal(proposalId);
    const signer = await getSigner();
    const account = await signer.getAddress();
    const { shares, signalStrength } = await fetchLatestVote(account, proposalId);
    const info = await getProposalInformation(txHash);
    const communityInfo = await getCommunityInformation(info.communityId);

    this.querySelector('#title').textContent = info.title;
    this.querySelector('#link').href = info.link;
    this.querySelector('#community').textContent = communityInfo.title;

    const token = await _getTokenCached(communityInfo.governanceToken);
    const units = ethers.utils.formatUnits(shares, token._decimals);
    const slider = this.querySelector('habitat-slider');
    const circle = this.querySelector('habitat-circle');

    slider.setRange(0, units, units, units);
    slider.addEventListener('change', () => {
      circle.setValue(slider.percent, renderAmount(slider.value), token._symbol);
    }, false);

    wrapListener(
      this.querySelector('button'),
      async () => {
        const _shares = ethers.BigNumber.from(shares).div(100).mul(slider.percent);
        await submitVote(info.communityId, proposalId, _shares.eq(0) ? 0 : signalStrength, _shares);
        await this.update();
      }
    );
  }
}

customElements.define('habitat-stake', HabitatStake);
