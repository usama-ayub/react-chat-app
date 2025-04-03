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
        const {selectedChatData, selectedChatType, addMessage, addContactInContactList} = useAppStore.getState();
        if(selectedChatType !== undefined && 
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ){
          console.log("Message Receive", message)
          addMessage(message)
        }
        addContactInContactList(message)
      };

      const handleChannelReciveMessage = (message:any)=>{
        const {selectedChatData, selectedChatType, addMessage, addChannelInChannelList} = useAppStore.getState();
        if(selectedChatType !== undefined && selectedChatData._id === message.channelId
        ){
          console.log("Message Receive", message)
          addMessage(message)
        }
        addChannelInChannelList(message)
      };

      socket.current.on('recieveMessage',handleReciveMessage);
      socket.current.on('recieve-channel-message',handleChannelReciveMessage);

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
