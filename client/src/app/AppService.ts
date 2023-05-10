// class GlobalService {
//     setUserId(userId: string): void => localStorage.setItem("userId", userId);
//     getUserId(): string | null => localStorage.getItem("userId");
//     setUserName = (userName: string): void => localStorage.setItem("userName", userName);
//     getUserName = (): string | null => localStorage.getItem("userName");
// }
// export const globalService = new GlobalService();


const setUserId = (userId: string): void => localStorage.setItem("userId", userId);
const getUserId = (): string | null => localStorage.getItem("userId");
const setUserName = (userName: string): void => localStorage.setItem("userName", userName);
const getUserName = (): string | null => localStorage.getItem("userName");

const showUsernamePopup = () => {

}

const send = (msg: string): void => {
    alert(msg);
}

export const AppService = {
    // attachWsToRoom,
    // throwCard,
    // flipCards,
    // clearCards,
    setUserId,
    getUserId,
    setUserName,
    getUserName,
    showUsernamePopup,
    send
}


