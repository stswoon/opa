import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";

const template = () => `
<div class="opa-call" x-data="{}">
    <ui5-button x-on:click="window.app.setupPeer();">${strings.OpaCall.setupPeer}</ui5-button>
    <ui5-button x-on:click="window.app.callPeer();">${strings.OpaCall.callPeer}</ui5-button>
    <ui5-button x-on:click="window.app.hangUpPeer();">${strings.OpaCall.hangUpPeer}</ui5-button>

    <video id="localVideo" autoPlay playsInline muted></video>
    <video id="remoteVideo" autoPlay playsInline></video>
</div>
`;


class OpaCall extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
    }
}

customElements.define("opa-call", OpaCall);
