// import "./user-list-component.css";
// import template from "./user-list-component.html?raw";

// https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
// https://reactgo.com/javascript-convert-string-literal/
export const interpolateTemplateString = (s: string, params: object): string => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
}

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
        console.log("Params=",params)
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
