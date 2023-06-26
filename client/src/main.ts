import "alpinejs/dist/cdn.min.js"

//https://sap.github.io/ui5-webcomponents/playground/components
import "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents/dist/List";
import "@ui5/webcomponents/dist/StandardListItem";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Title";
import "@ui5/webcomponents/dist/Toast";
import "@ui5/webcomponents/dist/Input";

import "./app/components/opa-header"
import "./app/components/opa-messages"
import "./app/components/opa-send-control"
import "./app/components/opa-user-list"
import "./app/components/opa-username-popup"

import "./style.css"

import {AppService} from "./app/services/AppService";

(window as any).app = AppService;
AppService.init();
