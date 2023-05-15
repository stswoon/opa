import "alpinejs/dist/cdn.min"

import UIkit from "uikit/dist/js/uikit.min"
(window as any).UIkit = UIkit;
// import "uikit/dist/js/uikit-icons.min"
import "uikit/dist/css/uikit.min.css"

import {AppService} from "./app/services/AppService";
(window as any).app = AppService;
AppService.init()

import './style.css'

import './app/OpaHeaderComponent'
import './app/username/UsernamePopupComponent'
import './app/OpaChatComponent.ts'
import './app/user-list/user-list-component.ts'

//TODO
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js', {scope: './'})
// }
