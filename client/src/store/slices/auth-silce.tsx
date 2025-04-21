export const createAuthSlice = (set:any) => (
    {
        userInfo: undefined,
        setUserInfo: (userInfo:any) => set({ userInfo }),
        
        onlineUsers:[],
        setOnlineUsers: (onlineUsers:Array<any>) => set({ onlineUsers }),
    }
)