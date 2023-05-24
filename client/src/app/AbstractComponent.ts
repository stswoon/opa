// import "./user-list-component.css";
// import template from "./user-list-component.html?raw";
import {interpolateTemplateString} from "./utils";

export type templateTypeFunction = (params: any) => string;

//https://learn.javascript.ru/custom-elements
export abstract class AbstractComponent extends HTMLElement {
    protected readonly template: templateTypeFunction;

    protected constructor(template: templateTypeFunction) {
        super();
        this.template = template;
    }

    protected render() {
        const params = {};
        console.log((this.constructor as any).observedAttributes);
        for (let attribute of (this.constructor as any).observedAttributes) {
            params[attribute] = this.getAttribute(attribute);
        }
        this.innerHTML = this.template(params);
        // this.innerHTML = interpolateTemplateString(this.template, params);
    }

    // protected getTemplate(params): string {
    //     if (Object.values(params).includes(null)) {
    //         return "";
    //     }
    //     return interpolateTemplateString(this.template, params);
    // }

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
