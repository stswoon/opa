import template from "./opa-chat-component.html?raw";
import {ProcessMessageService} from "../services/ProcessMessageService";
import {interpolateTemplateString} from "../utils";

class OpaMessages extends HTMLElement {
    rendered: boolean = false;
    messages: [];

    constructor() {
        super();
        ProcessMessageService.onChange((appState) => {
            this.messages = appState.messages.map(msg => {
                let user = appState.users.find(user => user.id === msg.userId);
                let userName
                if (user != null) {
                    userName = user.name;
                } else {
                    userName = msg.userId;
                }
                return {author: userName, text: msg.text};
            })
            this.render();
        });
    }

    render() {
        this.innerHTML = interpolateTemplateString(template, {messages: JSON.stringify(this.messages)});
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-messages", OpaMessages);
