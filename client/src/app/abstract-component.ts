// import "./user-list-component.css";
// import template from "./user-list-component.html?raw";
import {interpolateTemplateString} from "./utils";

//https://learn.javascript.ru/custom-elements
export class AbstractComponent extends HTMLElement {
    protected readonly template: string;

    protected constructor(template: string) {
        super();
        this.template = template;
    }

    protected render() {
        const params = {};
        for (let attribute in AbstractComponent.observedAttributes) {
            params[attribute] = this.getAttribute(attribute);
        }
        this.innerHTML = interpolateTemplateString(this.template, params);
    }

    static get observedAttributes(): string[] {
        return [];
    }

    // attributeChangedCallback(name, oldValue, newValue)
    protected attributeChangedCallback(): void {
        this.render();
    }

    private rendered: boolean = false;

    private connectedCallback(): void {
        if (this.rendered) return;
        this.rendered = true;
        this.render();
    }
}

// customElements.define("opa-username-popup", UsernamePopupComponent);
