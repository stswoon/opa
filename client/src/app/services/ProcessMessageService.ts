export interface User {
    id: string;
    name: string;
}

export interface Message {
    id: string;
    text: string;
    userId: string;
    date: string; //milisec
}

export interface AppState {
    users: User[]
    messages: Message[]; //last 5 min messages
}

const process = (appState: AppState): void => {

    document.querySelector("user-list").setAttribute("users", JSON.stringify(appState.users));
    // window.

    callbacks.forEach(callback => callback(appState));
}

const callbacks: Function[] = [];
const onChange = (callback: Function): void => {
    callbacks.push(callback);
}


export const ProcessMessageService = {
    process,
    onChange
};
