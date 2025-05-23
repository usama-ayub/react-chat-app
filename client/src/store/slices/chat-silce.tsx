export const createChatSlice = (set: any, get: any) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  directMessagesNotifications:{},
  typingUsers: {},
  replyMessage: {},
  setChannels: (channels: Array<any>) => set({ channels }),
  setDirectMessagesNotifications: (directMessagesNotifications: any) => set({ directMessagesNotifications }),
  setReplyMessage: (replyMessage: any) => set({ replyMessage }),
  setTypingUser: (userId: string) => {
    const typingUsers = { ...get().typingUsers };
    typingUsers[userId] = true;
    set({ typingUsers });
  },
  removeTypingUser: (userId: string) => {
    const typingUsers = { ...get().typingUsers };
    delete typingUsers[userId];
    set({ typingUsers });
  },

  setIsUploading: (isUploading: boolean) => set({ isUploading }),
  setIsDownloading: (isDownloading: boolean) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress: number) =>
    set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress: number) =>
    set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType: any) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData: any) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages: any) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts: any) =>
    set({ directMessagesContacts }),
  addChannel: (channel: any) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
  addMessage: (message: any) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },
  addChannelInChannelList:(message:any)=>{
     const channels = get().channels;
     const data = channels.find((channel:any)=>channel._id == message.channelId);
     const index = channels.findIndex(
      (channel:any)=>channel._id == message.channelId
     );
     if(index !== -1 && index !== undefined){
      channels.splice(index,1);
      channels.unshift(data);
     }
  },
  addContactInContactList:(message:any)=>{
    const userId = get().userInfo._id;
    const fromId = message.sender._id == userId ? message.recipient._id : message.sender._id;
    const fromData = message.sender._id == userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contact:any)=>contact._id == fromId);
    const index = dmContacts.findIndex(
      (contact:any)=>contact._id == fromId
     );
     if(index !== -1 && index !== undefined){
      dmContacts.splice(index,1);
      dmContacts.unshift(data);
     } else{
      dmContacts.unshift(fromData);
     }
     set({directMessagesContacts:dmContacts});
 }
});
