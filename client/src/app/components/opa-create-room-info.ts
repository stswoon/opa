import {AbstractComponent} from "../AbstractComponent";

const template = () => `
<ui5-title level="H1">Create Room First</ui5-title>
`;

class OpaCreateRoomInfo extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-create-room-info", OpaCreateRoomInfo);
