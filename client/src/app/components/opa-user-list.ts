import {AbstractComponent} from "../AbstractComponent";
import {AppService} from "../services/AppService";
import {strings} from "../strings";

const template = ({users}) => {
    users = JSON.stringify(users || []);
    return `
        <ui5-list id="opa-user-list" class="opa-user-list full-width" x-data='{ users : ${users} }'>
            <template x-for="user in users">
                <ui5-li
                    x-text="user.name"
                    x-bind:additional-text="user.active ? '' : '${strings.OpaUserList.inactive}'"
                    additional-text-state="Information"
                ></ui5-li>
            </template>
        </ui5-list>
    `;
};

class OpaUserList extends AbstractComponent {
    constructor() {
        super(template, {users: []});
        AppService.onStateChange((appState) => {
            this.state.users = appState.users || [];
            this.render();
        });
    }
}

customElements.define("opa-user-list", OpaUserList);
