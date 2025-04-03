import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-silce";
import { createChatSlice } from "./slices/chat-silce";

// export const useAppStore = create()((...a) =>({
//     ...createAuthSlice(...a),
// }));
export const useAppStore = create<any>((set, get) => ({
  ...createAuthSlice(set),
  ...createChatSlice(set, get),
}));
