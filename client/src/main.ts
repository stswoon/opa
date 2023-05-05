import "alpinejs/dist/cdn.min"
import UIkit from "uikit/dist/js/uikit.min"
(window as any).UIkit = UIkit;
// import "uikit/dist/js/uikit-icons.min"
import "uikit/dist/css/uikit.min.css"

import './style.css'

import {AppService} from "./app/AppService";
(window as any).AppService = AppService;

import './app/room/RoomComponent.ts'
import './app/username/UsernamePopupComponent'
import './app/OpaHeaderComponent'
