import "./user-list-component.css";
// import template from "./user-list-component.html?raw";
import {AbstractComponent} from "../abstract-component";

const template = (users) => `
<ui5-list id="opa-user-list" class="opa-user-list" x-data='{ users : ${users} }' class="full-width">
<!--<ui5-li icon="nutrition-activity">qwe</ui5-li>-->
<ui5-li icon="nutrition-activity" description="Tropical plant with an edible fruit" additional-text="In-stock" additional-text-state="Success">Pineapple</ui5-li>
<!--<ui5-li icon="nutrition-activity" x-for="user in users" x-text="user.name"></ui5-li>-->
    <template x-for="user in users">
        <ui5-li icon="nutrition-activity" x-text="user.name" additional-text="In-stock"></ui5-li>
    </template>
</ui5-list>
`;

class UserListComponent extends AbstractComponent {
    constructor() {
        // super(template);
        super("");
    }

    protected render() {
        super.render();

        setTimeout(() => {
            var objDiv = document.getElementById("opa-user-list");
            objDiv.scrollTop = objDiv.scrollHeight; //TODO
        }, 1000);
    }

    protected getTemplate({users}): string {
        return template(users);
    }

    static get observedAttributes() {
        return ["users"];
    }
}

customElements.define("user-list", UserListComponent);
