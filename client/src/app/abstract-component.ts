//https://learn.javascript.ru/custom-elements
import "./user-list-component.css";
import template from "./user-list-component.html?raw";

class UserListComponent extends HTMLElement {
    rendered: boolean = false;

    render() {
        let users = this.getAttribute("users");
        this.innerHTML = template;
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ["users"];
    }
}

customElements.define("user-list", UserListComponent);
