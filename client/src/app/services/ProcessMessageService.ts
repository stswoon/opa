const process = (appState: AppState): void => {

    document.querySelector("opa-user-list").setAttribute("users", JSON.stringify(appState.users));
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
