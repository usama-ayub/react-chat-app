import ChatHeader from "./chatHeader";
import MessageBar from "./messageBar";
import MessageContainer from "./messageContainer";

function ChatContainer() {
  return (
    <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <ChatHeader />
      <MessageContainer />
      <MessageBar />
    </div>
  );
}

export default ChatContainer;
