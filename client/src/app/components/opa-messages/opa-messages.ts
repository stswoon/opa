import template from "./opa-messages.html?raw";
import {interpolateTemplateString} from "../../utils";
import {AppService} from "../../services/AppService";

class OpaMessages extends HTMLElement {
    private rendered: boolean = false;
    private messages: [] = [];

    constructor() {
        super();
        AppService.onStateChange((appState) => {
            this.messages = appState.messages.map(msg => {
                let user = appState.users.find(user => user.id === msg.userId);
                let userName = user ? user.name : msg.userId;
                return {author: userName, text: msg.text, date: (new Date(msg.date)).toLocaleTimeString()};
            }) || [];
            this.render();
        });
    }

    render() {
        this.innerHTML = interpolateTemplateString(template, {messages: JSON.stringify(this.messages)});

        setTimeout(() => {
            let objDiv = document.querySelector(".opa-chat");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 0);
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-messages", OpaMessages);
