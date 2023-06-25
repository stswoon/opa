import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";

const template = () => `
<div class="opa-chat-controls" x-data="{msg:''}">
    <textarea x-model="msg"></textarea>
    <ui5-button
        x-bind:disabled="!msg"
        x-on:click="window.app.send(msg);msg='';"
        design="Emphasized"
    >${strings.OpaSendControl.send}</ui5-button>
</div>
`;

class OpaSendControl extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-send-control", OpaSendControl);
