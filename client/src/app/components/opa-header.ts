//TODO localizations

import {AbstractComponent} from "../AbstractComponent";

const template = () => `
<div class="opa-header">
     <ui5-button onclick="app.showUsernamePopup()">Change Name</ui5-button>
     <ui5-button onclick="app.createRoom()">Create Room</ui5-button>
     <ui5-button onclick="app.leaveRoom()">Leave Room</ui5-button>
</div>
`;

class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-header", OpaHeader);
