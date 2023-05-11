// import "./user-list-component.css";
// import template from "./user-list-component.html?raw";
import {interpolateTemplateString} from "./utils";

//https://learn.javascript.ru/custom-elements
export abstract class AbstractComponent extends HTMLElement {
    protected readonly template: string;

    protected constructor(template: string) {
        super();
        this.template = template;
    }

    protected render() {
        const params = {};
        console.log((this.constructor as any).observedAttributes);
        for (let attribute in (this.constructor as any).observedAttributes) {
            params[attribute] = this.getAttribute(attribute);
        }
        this.innerHTML = interpolateTemplateString(this.template, params);
    }

    static get observedAttributes(): string[] {
        return [];
    }

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
