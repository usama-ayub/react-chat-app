export const createAuthSlice = (set:any) => (
    {
        userInfo: undefined,
        setUserInfo: (userInfo:any) => set({ userInfo })
    }
)