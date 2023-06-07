import "./username.css";
import userLogo from "./user.svg";
import {AbstractComponent} from "../../AbstractComponent";
import {AppService} from "../../services/AppService";


const template = ({username = ""}) => `
<div>
    <ui5-dialog id="opa-username-dialog"
                header-text="Change user name"
                x-data="{username:'${username}'}"
    >
        <div class="username-component">
            <img height="30" width="30" src="${userLogo}" />
            <input type="text" x-model="username">
        </div>
        <div slot="footer">
            <ui5-button>Save</ui5-button>
        </div>
    </ui5-dialog>
    <ui5-toast id="wcToastTC" placement="TopCenter">Please enter username</ui5-toast>
</div>
`;

//TODO blink because of username change -> make two components
//TODO create popup with template
class OpaUsernamePopup extends AbstractComponent {
    constructor() {
        super(template);
    }


    protected render() {
        super.render();
        //todo change to this
        const dialogCloser = document.querySelector("#opa-username-dialog ui5-button");
        const dialogInput: any = document.querySelector("#opa-username-dialog input");
        dialogCloser.addEventListener("click", () => {
            const username = dialogInput.value;
            if (username) {
                AppService.setUserName(username);
                AppService.closeUsernamePopup();
            } else {
                (window as any).wcToastTC.show();
            }
        });
    }

    static get observedAttributes() {
        // return [];
        return ["username"];
    }
}

customElements.define("opa-username-popup", OpaUsernamePopup);
