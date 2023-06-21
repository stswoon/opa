import {AbstractComponent} from "../AbstractComponent";
import {AppService} from "../services/AppService";

const template = ({users}) => `
<ui5-list id="opa-user-list" class="opa-user-list full-width" x-data='{ users : ${users} }'>
    <template x-for="user in users">
        <ui5-li
            x-text="user.name"
            x-bind:additional-text="user.active ? '' : 'Inactive'"
            additional-text-state="Information"
        ></ui5-li>
    </template>
</ui5-list>
`;

class OpaUserList extends AbstractComponent {
    private users: [] = [];

    constructor() {
        super(template);
        AppService.onStateChange((appState) => {
            this.users = appState.users || [];
            this.render();
        });
    }

    protected render() {
        this.innerHTML = this.template({users: JSON.stringify(this.users)});
    }
}

customElements.define("opa-user-list", OpaUserList);
