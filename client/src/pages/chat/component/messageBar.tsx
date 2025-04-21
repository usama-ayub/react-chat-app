import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaMicrophone } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { UPLOAD_FILE } from "@/constants";
import CaptureAudio from "./captureAudio";

function MessageBar() {
  const emojiRef = useRef<any>(null);
  const fileInputRef = useRef<any>(null);
  const socket:any = useSocket();
 const {selectedChatData, selectedChatType,userInfo, setIsUploading, setFileUploadProgress} = useAppStore();

  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleEmoji = async (emoji: any) => {
    setMessage((meg) => meg + emoji.emoji);
  };

  const handleAttachmentClick = ()=>{
    if(fileInputRef.current){
      fileInputRef.current.click();
    }
  }
  const handleAttachmentChange = async (event:any)=>{
    try {
      const file = event.target.files[0];
      console.log(file)
      if(file){
        const formData = new FormData();
        formData.append("file",file);
        setIsUploading(true);
      const response = await apiClient.post(
        UPLOAD_FILE,
        formData,
        {
          withCredentials: true,
          onUploadProgress:(data:any)=>{
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          }
        }
      );
      if (response.status == 200) {
        setIsUploading(false);
        if(selectedChatType == 'contact'){
          socket.emit("sendMessage",{
            sender: userInfo._id,
            content:undefined,
            recipient: selectedChatData._id,
            messageType:"file",
            fileUrl:response.data.filePath
          })
        } else if(selectedChatType == 'channel'){
          socket.emit("send-channel-message",{
            sender: userInfo._id,
            content:undefined,
            channelId: selectedChatData._id,
            messageType:"file",
            fileUrl:response.data.filePath
          })
        }
      }
      }
    } catch (e) {
      setIsUploading(false);
    }
  }
  const handleSendMessage = async () => {
    try {
      if(selectedChatType == 'contact'){
        socket.emit("sendMessage",{
          sender: userInfo._id,
          content:message,
          recipient: selectedChatData._id,
          messageType:"text",
          fileUrl:undefined
        })
      } else if(selectedChatType == 'channel'){
        socket.emit("send-channel-message",{
          sender: userInfo._id,
          content:message,
          channelId: selectedChatData._id,
          messageType:"text",
          fileUrl:undefined
        })
      }
      setMessage('');
    } catch (e) {}
  };

  return (
    <div className="h-10[vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      {!showAudioRecorder && (
        <div className="flex flex-1 bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
          <input
            type="text"
            className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleAttachmentClick}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          >
            <GrAttachment className="text-2xl" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAttachmentChange}
          />
          <div className="relative">
            <button
              className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
              onClick={() => setEmojiPickerOpen(true)}
            >
              <RiEmojiStickerLine className="text-2xl" />
            </button>
            <div className="absolute bottom-16 right-0" ref={emojiRef}>
              <EmojiPicker
                open={emojiPickerOpen}
                onEmojiClick={handleEmoji}
                autoFocusSearch={false}
              />
            </div>
          </div>
        </div>
      )}
      {message.length ? (
        <button
          onClick={handleSendMessage}
          className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        >
          <IoSend className="text-2xl" />
        </button>
      ):<></>}
      {!showAudioRecorder && (
        <button
          onClick={() => setShowAudioRecorder(true)}
          className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        >
          <FaMicrophone className="text-2xl" />
        </button>
      )}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
    </div>
  );
}

export default MessageBar;
