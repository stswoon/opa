import "alpinejs/dist/cdn.min"

// https://learn.javascript.ru/custom-elements

class AlpineWebComponent extends HTMLElement {
    rendered: boolean = false;

    render() { // (1)
        let name = this.getAttribute('name');
        this.innerHTML =
            `<div x-data="{ open: false }">
                     <button @click="open = !open">Pls, expand ${name}</button>
                     <span x-show="open">Content...</span>
                </div>`
    }

    connectedCallback() { // (2)
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("alpine-web-component", AlpineWebComponent);
