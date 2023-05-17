import "./opa-chat-component.css";
import template from "./opa-chat-component.html?raw";
import {ProcessMessageService} from "./services/ProcessMessageService";

const interpolateString = function (s, params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
}

const interpolate2 = function (s) {
    return eval("`" + s + "`");
}

class OpaChatComponent extends HTMLElement {
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
        })
    }

    render() {

        this.innerHTML = interpolateString(template, {messages: JSON.stringify(this.messages)});
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-chat-component", OpaChatComponent);
