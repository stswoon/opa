export interface Room {
    id: string,
    name: string,
    users: User[],
    messages: Message[]
}

export interface User {
    id: string;
    name: string;
    active: boolean;
}

export interface Message {
    id: string;
    text: string;
    userId: string;
    date: number; //milisec
}
