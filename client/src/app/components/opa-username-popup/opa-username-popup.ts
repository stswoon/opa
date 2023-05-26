import "./username.css";
import userLogo from "./user.svg";
import {AbstractComponent} from "../../AbstractComponent";

const template = ({username = "", display = "block"}) => `
<div style="display:${display}">
    <ui5-dialog id="opa-username-popup"
                header-text="Change user name"
                x-data="{username:'${username}'}"
    >
        <div class="username-component">
            <img height="30" width="30" src="${userLogo}" />
            <input type="text" x-model="username">
        </div>
        <div slot="footer">
            <ui5-button x-on:click="opaUsernamePopup.close(); app.setUserName(username);">Save</ui5-button>
        </div>
    </ui5-dialog>
</div>
`;

//TODO create popup with template
class OpaUsernamePopup extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
        (window as any).opaUsernamePopup = document.getElementById("opa-username-popup");
        console.log("anneq2::" + (window as any).opaUsernamePopup);
        setTimeout(() => {
            (window as any).opaUsernamePopup.show();
        });
    }

    static get observedAttributes() {
        return ["username", "display"];
    }
}

customElements.define("opa-username-popup", OpaUsernamePopup);
