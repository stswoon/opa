import "./UserName.css";
import userLogo from "./user.svg";

//https://learn.javascript.ru/custom-elements
class UserNameComponent extends HTMLElement {
    rendered: boolean = false;

    render() {
        let name = this.getAttribute("name");
        let buttonText = this.getAttribute("buttonText");
        let onchange = this.getAttribute("onchange");
        this.innerHTML =
            `<div class="user-name-component">
                <img src="${userLogo}" />
                <input type="text" value="${name}" onchange="${onchange}">
                <button>${buttonText}</button>
            </div>`
    }

    static get observedAttributes() {
        return ["name", "buttonText", "onchange"];
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

customElements.define("user-name-component", UserNameComponent);
