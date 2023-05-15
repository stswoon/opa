interface User {
    id: string;
    name: string;
}

interface Message {
    messageId: string;
    text: string;
    userId: string;
    date: string; //milisec
}

interface AppState {
    users: User[]
    messages: Message[]; //last 5 min messages
}


const process = (appState: AppState): void => {

}


export const ProcessMessageService = {
    process
};
