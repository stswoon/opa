import {AbstractComponent} from "../AbstractComponent";

const template = ({users = []}) => `
<ui5-list id="opa-user-list" class="opa-user-list full-width" x-data='{ users : ${users} }'>
    <template x-for="user in users">
        <ui5-li x-text="user.name" additional-text="Actibe"></ui5-li>
    </template>
</ui5-list>
`;

class OpaUserList extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();

        setTimeout(() => {
            var objDiv = document.getElementById("opa-user-list");
            objDiv.scrollTop = objDiv.scrollHeight; //TODO
        }, 1000);
    }

    static get observedAttributes() {
        return ["users"];
    }
}

customElements.define("opa-user-list", OpaUserList);
