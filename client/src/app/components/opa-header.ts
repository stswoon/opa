import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";

const template = (params: any) => {
    const roomExist = params["room-exist"];
    return `
        <div class="opa-header" x-data='{ roomExist: ${roomExist} }'>
             <ui5-button onclick="app.showUsernamePopup()">${strings.OpaHeader.changeName}</ui5-button>
             <ui5-button x-bind:class="{ '_shake': !roomExist }" onclick="app.createRoom()">${strings.OpaHeader.createRoom}</ui5-button>
             <ui5-button onclick="app.leaveRoom()">${strings.OpaHeader.leaveRoom}</ui5-button>
             <ui5-toast id="wcToastError" placement="TopCenter">${strings.OpaHeader.error}</ui5-toast>
             <ui5-title level="H1" x-show="!roomExist">${strings.OpaHeader.createRoomFirst}</ui5-title>
        </div>
    `;
};


class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }

    static get observedAttributes() {
        return ["room-exist"];
    }
}

customElements.define("opa-header", OpaHeader);
