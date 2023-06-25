import userLogo from "../icons/user.svg";
import {AbstractComponent} from "../AbstractComponent";
import {AppService} from "../services/AppService";
import {strings} from "../strings";

const template = ({username = ""}) => `
<ui5-dialog id="opa-username-dialog">
    <div slot="header">
        <ui5-title level="H5" slot="header">${strings.OpaUsernamePopup.changeUserName}</ui5-title>
    </div>
    <div class="opa-username-component">
        <img height="30" width="30" src="${userLogo}" />
        <ui5-input value="${username}"></ui5-input>
    </div>
    <div slot="footer">
        <ui5-button class="opa-username-popup__save" design="Emphasized">${strings.OpaUsernamePopup.save}</ui5-button>
        <ui5-button class="opa-username-popup__change-id" design="Attention">${strings.OpaUsernamePopup.changeId}</ui5-button>
    </div>
    <ui5-toast id="wcToastPopup" placement="TopCenter">${strings.OpaUsernamePopup.pleaseEnterUsername}</ui5-toast>
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
        dialogSaveButton!.addEventListener("click", () => {
            const username = dialogInput.value;
            if (username) {
                AppService.setNewUserName(username);
                AppService.closeUsernamePopup();
            } else {
                (window as any).wcToastPopup.show();
            }
        });

        const dialogChangeIdButton = document.querySelector("#opa-username-dialog .opa-username-popup__change-id");
        dialogChangeIdButton!.addEventListener("click", () => {
            AppService.setNewUserId();
            AppService.closeUsernamePopup();
        });
    }

    static get observedAttributes() {
        // return [];
        return ["username"];
    }
}

customElements.define("opa-username-popup", OpaUsernamePopup);
