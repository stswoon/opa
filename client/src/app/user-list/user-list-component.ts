import "./user-list-component.css";
import template from "./user-list-component.html?raw";
import {AbstractComponent} from "../abstract-component";

class UserListComponent extends AbstractComponent {
    constructor() {
        super(template);
    }

    static get observedAttributes() {
        return ["users"];
    }
}

customElements.define("user-list", UserListComponent);
