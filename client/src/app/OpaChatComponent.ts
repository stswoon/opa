import "./opa-chat-component.css";
import template from "./opa-chat-component.html?raw";

const interpolateString = function(s, params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
}

const interpolate2 = function(s) {
    return eval('`' + s + '`');
}

class OpaChatComponent extends HTMLElement {
    rendered: boolean = false;

    render() {
        let name = this.getAttribute("name");
        let test = "hello"
        // this.innerHTML = template;
        // this.innerHTML = String.raw({raw: [template]}, [test]);
        this.innerHTML = interpolateString(template, {test});
        // this.innerHTML = interpolate2(template);
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-chat-component", OpaChatComponent);
