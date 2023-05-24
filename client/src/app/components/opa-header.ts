//TODO localizations

class OpaHeader extends HTMLElement {
    rendered: boolean = false;

    render() {
        let name = this.getAttribute("name");
        this.innerHTML =
            `<div class="opa-header" x-data="{showUsernamePopup:false}">
                 <button @click="UIkit.modal('#changeUsernamePopup').show()" class="uk-button uk-button-default">Change Name</button>
                 <button class="uk-button uk-button-default" onclick="app.createRoom()">Create Room</button>
                 <button class="uk-button uk-button-default" onclick="app.leaveRoom()">Leave Room</button>
            </div>`
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }
}

customElements.define("opa-header", OpaHeader);
