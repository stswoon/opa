import "./username.css";
import userLogo from "./user.svg";

//TODO create popup with template
//https://learn.javascript.ru/custom-elements
class UsernamePopupComponent extends HTMLElement {
    rendered: boolean = false;

    render() {
        let username = this.getAttribute("username");
        let okButtonText = this.getAttribute("okButtonText");
        // let onchange = this.getAttribute("onchange");
        this.innerHTML = `
            <div uk-modal id="changeUsernamePopup">
                <div class="uk-modal-dialog uk-modal-body" x-data="{username:'${username}'}">
                    <h2 class="uk-modal-title">Change user name</h2>
                    <div class="username-component">
                        <img height="30" width="30" src="${userLogo}" />
                        <input type="text" x-model="username">
                    </div>
                    <button class="uk-modal-close" type="button"
                        x-on:click="app.setUserName(username)">${okButtonText}</button>
                </div>
            </div>
        `;
    }

    static get observedAttributes() {
        return ["username", "okButtonText"];
    }

    // attributeChangedCallback(name, oldValue, newValue)
    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-username-popup", UsernamePopupComponent);
