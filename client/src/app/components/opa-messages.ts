import {AppService} from "../services/AppService";
import {AbstractComponent} from "../AbstractComponent";
import {AppState} from "../services/AppStateModels";

//@ts-ignore
const template = ({messages}) => {
    messages = JSON.stringify(messages || []);
    return `
        <div class="opa-messages" x-data='{ messages : ${messages} }'>
            <template x-for="message in messages">
                <div class="opa-messages_item" x-bind:class="{ '_system': message.system }">
                    <span class="opa-messages_item-date" x-text="message.date"></span>
                    <span class="opa-messages_item-author" x-text="message.author"></span>
                    <span class="opa-messages_item-delimiter">:</span>
                    <span class="opa-messages_item-text" x-text="message.text"></span>
                </div>
            </template>
        </div>
    `;
};

class OpaMessages extends AbstractComponent {
    constructor() {
        super(template, {messages: []});
        AppService.onStateChange((appState: AppState) => {
            const messages = appState.messages.map(msg => {
                let user = appState.users.find(user => user.id === msg.userId);
                let userName = user ? user.name : msg.userId;
                return {
                    author: userName,
                    text: msg.text,
                    date: (new Date(msg.date)).toLocaleTimeString(),
                    system: msg.userId === "_system"
                };
            });
            this.state.messages = messages || [];
            this.render();
        });
    }

    render() {
        super.render();
        setTimeout(() => {
            let objDiv = document.querySelector(".opa-messages")!;
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 0);
    }
}

customElements.define("opa-messages", OpaMessages);
