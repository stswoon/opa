import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";

const template = () => `<ui5-title level="H1">${strings.OpaCreateRoomInfo.createRoomFirst}</ui5-title>`;

class OpaCreateRoomInfo extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-create-room-info", OpaCreateRoomInfo);
