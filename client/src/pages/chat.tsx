import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactContainer from "./chat/component/contactContainer";
import EmptyChatContainer from "./chat/component/emptyChatContainer";
import ChatContainer from "./chat/component/chatContainer";

function Chat() {
  const { userInfo, selectedChatType, isUploading, isDownloading,fileUploadProgress,fileDownloadProgress } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo.profileStatus) {
      toast('Please setup profile to continue.');
      navigate('/profile');
    }
  }, [userInfo, navigate])

  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      {
        isUploading && <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">Uploading File</h5>
          {fileUploadProgress}%
        </div>
      }
       {
        isDownloading && <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">Downloading File</h5>
          {fileDownloadProgress}%
        </div>
      }
      <ContactContainer/>
      {
        selectedChatType ? <ChatContainer/> : <EmptyChatContainer/>
      }
    </div>
  )
}

export default Chat
