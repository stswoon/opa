class RoomComponent extends HTMLElement {
    rendered: boolean = false;

    render() {
        let name = this.getAttribute("name");
        this.innerHTML =
            `<div x-data="{ open: false }">
                     <button @click="open = !open">Pls, expand ${name}</button>
                     <div x-show="open">
                        <user-name-component name="test" buttonText="qwe"></user-name-component>
                    </div>
            </div>`
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("room-component", RoomComponent);
