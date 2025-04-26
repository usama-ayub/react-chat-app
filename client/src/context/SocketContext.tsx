import { HOST } from "@/constants";
import { useAppStore } from "@/store";
import { createContext, useEffect, useContext, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }:any) => {
  const socket = useRef<any>(null);
  const { userInfo } = useAppStore();
  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo._id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const handleReciveMessage = (message:any)=>{
        const {selectedChatData, selectedChatType, addMessage, addContactInContactList, directMessagesNotifications, setDirectMessagesNotifications} = useAppStore.getState();
        if(selectedChatType !== undefined && 
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ){
          addMessage(message)
        }

        if (!selectedChatType && message.recipient._id && message.sender._id) {
          const recipientId = message.sender._id;
          const updatedNotifications = { ...directMessagesNotifications };
      
          if (updatedNotifications[recipientId]) {
            updatedNotifications[recipientId] += 1;
          } else {
            updatedNotifications[recipientId] = 1;
          }
          setDirectMessagesNotifications(updatedNotifications);
        }

        if (selectedChatType && message.recipient._id && message.sender._id && (selectedChatData._id !== message.sender._id)) {
          const recipientId = message.sender._id;
          const updatedNotifications = { ...directMessagesNotifications };
      
          if (updatedNotifications[recipientId]) {
            updatedNotifications[recipientId] += 1;
          } else {
            updatedNotifications[recipientId] = 1;
          }
          setDirectMessagesNotifications(updatedNotifications);
        }

        addContactInContactList(message)
      };

      const handleChannelReciveMessage = (message:any)=>{
        const {selectedChatData, selectedChatType, addMessage, addChannelInChannelList} = useAppStore.getState();
        if(selectedChatType !== undefined && selectedChatData._id === message.channelId
        ){
          addMessage(message)
        }
        addChannelInChannelList(message)
      };
      const handleDMDeleteMessage =(message:any)=>{
        const {selectedChatType, selectedChatMessages, setSelectedChatMessages, selectedChatData} = useAppStore.getState();
        if(selectedChatType  && 
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)){
          const selectedChat = [...selectedChatMessages];
          const index = selectedChat.findIndex((messageId:any)=>{
             return messageId._id == message._id
          });
          selectedChat[index].isDelete = message.isDelete;
          setSelectedChatMessages(selectedChat);
        }
      }
      const updateDMMessage =(message:any)=>{
        const {selectedChatData, selectedChatType, selectedChatMessages, setSelectedChatMessages} = useAppStore.getState();
        if(selectedChatType  && 
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)){
          const selectedChat = [...selectedChatMessages];
          const index = selectedChat.findIndex((messageId:any)=>{
             return messageId._id == message._id
          });
          selectedChat[index].isEdit = message.isEdit;
          selectedChat[index].content = message.content;
          setSelectedChatMessages(selectedChat);
        }
      }
      const reactionDMMessage =(message:any)=>{
        const {selectedChatData,selectedChatType, selectedChatMessages, setSelectedChatMessages} = useAppStore.getState();
        if(selectedChatType  && 
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)){
          const selectedChat = [...selectedChatMessages];
          const index = selectedChat.findIndex((messageId:any)=>{
             return messageId._id == message._id
          });
          selectedChat[index].reaction = message.reaction;
          setSelectedChatMessages(selectedChat);
        }
      }
      socket.current.on('recieveMessage',handleReciveMessage);
      socket.current.on('recieve-channel-message',handleChannelReciveMessage);
      socket.current.on("userStatusUpdate", ({ onlineUsers }:any) => {
        useAppStore.getState().setOnlineUsers(onlineUsers);
      });
      socket.current.on("typing", ({ senderId }:any) => {
        useAppStore.getState().setTypingUser(senderId);
      });
      
      socket.current.on("stopTyping", ({ senderId }:any) => {
        useAppStore.getState().removeTypingUser(senderId);
      });
      socket.current.on('deleteDMMessage',handleDMDeleteMessage);
      socket.current.on('updateDMMessage',updateDMMessage);
      socket.current.on('reactionDMMessage',reactionDMMessage);
      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
