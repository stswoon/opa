import {AbstractComponent} from "../AbstractComponent";

const template = () => `
    <div class="opa-chat-controls" x-data="{msg:''}">
        <textarea x-model="msg"></textarea>
        <ui5-button x-on:click="window.app.send(msg);" design="Emphasized">Send</ui5-button>
    </div>
`;

class OpaSendControl extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-send-control", OpaSendControl);
