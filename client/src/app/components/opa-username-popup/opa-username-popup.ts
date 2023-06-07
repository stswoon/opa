import "./username.css";
import userLogo from "./user.svg";
import {AbstractComponent} from "../../AbstractComponent";
import {AppService} from "../../services/AppService";


const template = ({username = ""}) => `
<div slot="header">
    <ui5-title level="H5" slot="header">Change user name</ui5-title>
</div>
<div class="opa-username-component">
    <img height="30" width="30" src="${userLogo}" />
    <ui5-input value="${username}"></ui5-input>
</div>
<div slot="footer">
    <ui5-button>Save</ui5-button>
</div>
<ui5-toast id="wcToastTC" placement="TopCenter">Please enter username</ui5-toast>
`;

//TODO blink because of username change -> make two components
//TODO create popup with template
class OpaUsernameDialogContent extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
        //todo change to this
        const dialogCloser = document.querySelector("#opa-username-dialog ui5-button");
        const dialogInput: any = document.querySelector("#opa-username-dialog ui5-input");
        dialogInput.value = AppService.getUserName();
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

customElements.define("opa-username-dialog-content", OpaUsernameDialogContent);
