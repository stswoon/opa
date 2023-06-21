import "./username.css";
import userLogo from "./user.svg";
import {AbstractComponent} from "../../AbstractComponent";
import {AppService} from "../../services/AppService";

const template = ({username = ""}) => `
<ui5-dialog id="opa-username-dialog">
    <div slot="header">
        <ui5-title level="H5" slot="header">Change user name</ui5-title>
    </div>
    <div class="opa-username-component">
        <img height="30" width="30" src="${userLogo}" />
        <ui5-input value="${username}"></ui5-input>
    </div>
    <div slot="footer">
        <ui5-button class="opa-username-popup__save" design="Emphasized">Save</ui5-button>
        <ui5-button class="opa-username-popup__change-id" design="Attention">Change ID</ui5-button>
    </div>
    <ui5-toast id="wcToastTC" placement="TopCenter">Please enter username</ui5-toast>
</ui5-dialog>
`;

//TODO blink because of username change -> make two components
class OpaUsernamePopup extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();

        const dialogInput: any = document.querySelector("#opa-username-dialog ui5-input");
        dialogInput.value = AppService.getUserName();

        const dialogSaveButton = document.querySelector("#opa-username-dialog .opa-username-popup__save");
        dialogSaveButton.addEventListener("click", () => {
            const username = dialogInput.value;
            if (username) {
                AppService.setUserName(username);
                AppService.closeUsernamePopup();
            } else {
                (window as any).wcToastTC.show();
            }
        });

        const dialogChangeIdButton = document.querySelector("#opa-username-dialog .opa-username-popup__change-id");
        dialogChangeIdButton.addEventListener("click", () => {
            AppService.setUserNewId();
            AppService.closeUsernamePopup();
        });
    }

    static get observedAttributes() {
        // return [];
        return ["username"];
    }
}

customElements.define("opa-username-popup", OpaUsernamePopup);
