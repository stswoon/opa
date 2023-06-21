export interface User {
    id: string;
    name: string;
    active: boolean;
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
