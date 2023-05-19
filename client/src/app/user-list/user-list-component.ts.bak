import "./user-list-component.css";
import template from "./user-list-component.html?raw";
import {AbstractComponent} from "../abstract-component";
import {AppState, ProcessMessageService} from "../services/ProcessMessageService";
import {interpolateTemplateString} from "../utils";

class UserListComponent extends AbstractComponent {
    constructor() {
        super(template);

        // ProcessMessageService.onChange((appState: AppState) => {
        //     this.render();
        // })
    }

    protected render() {
        // const users: string | null = this.getAttribute("users");
        // if (users == null) return;
        //
        // this.innerHTML = `
        //     <div class="opa-user-list" x-data='{ users : ${users} }'>
        //         <template x-for="user in users">
        //             <span x-text="user.name"></span>
        //         </template>
        //     </div>
        // `;


        // const params = {};
        // console.log((this.constructor as any).observedAttributes);
        // for (let attribute of (this.constructor as any).observedAttributes) {
        //     if (this.getAttribute(attribute) != null) {
        //         params[attribute] = this.getAttribute(attribute);
        //     } else {
        //         return;
        //     }
        // }
        // this.innerHTML = interpolateTemplateString(this.template, params);

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

customElements.define("user-list", UserListComponent);
