import "./opa-chat-component.css";
import template from "./opa-chat-component.html?raw";

class OpaChatComponent extends HTMLElement {
    rendered: boolean = false;

    render() {
        let name = this.getAttribute("name");
        this.innerHTML = template;
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-chat-component", OpaChatComponent);
