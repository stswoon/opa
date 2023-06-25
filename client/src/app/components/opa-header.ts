import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";

const template = () => `
<div class="opa-header">
     <ui5-button onclick="app.showUsernamePopup()">${strings.OpaHeader.changeName}</ui5-button>
     <ui5-button onclick="app.createRoom()">${strings.OpaHeader.createRoom}</ui5-button>
     <ui5-button onclick="app.leaveRoom()">${strings.OpaHeader.leaveRoom}</ui5-button>
     <ui5-toast id="wcToastError" placement="TopCenter">${strings.OpaHeader.error}</ui5-toast>
</div>
`;

class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-header", OpaHeader);
