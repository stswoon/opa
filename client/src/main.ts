import "alpinejs/dist/cdn.min.js"
// import "alpinejs/dist/cdn.js"

import UIkit from "uikit/dist/js/uikit.min.js"
(window as any).UIkit = UIkit;
// import "uikit/dist/js/uikit-icons.min"
import "uikit/dist/css/uikit.min.css"

import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/StandardListItem.js";

import {AppService} from "./app/services/AppService";
(window as any).app = AppService;
AppService.init();

import './style.css'

import './app/OpaHeaderComponent'
import './app/username/UsernamePopupComponent'
import './app/OpaChatComponent.ts'
import './app/user-list/user-list-component.ts'

//TODO
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js', {scope: './'})
// }
