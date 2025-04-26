import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_MESSAGES, GET_CHANNEL_MESSAGES, HOST } from "@/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidEditAlt } from "react-icons/bi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  checkIfAudio,
  checkIfDocument,
  checkIfImage,
  getColor,
} from "@/lib/utils";
import VoiceMessage from "./voiceMessage";
import { Input } from "@/components/ui/input";
import { RiEmojiStickerLine } from "react-icons/ri";
import { GoReply } from "react-icons/go";
import { GrAttachment } from "react-icons/gr";
import { FaMicrophone } from "react-icons/fa";
import { useSocket } from "@/context/SocketContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IMessage } from "@/lib/interface";
import { InitialMessage } from "@/lib/initialValue";

function MessageContainer() {
  const scrollRef = useRef<any>(null);
  const tooltipRef = useRef<any>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const emojiMRef = useRef<any>(null);

  const {
    selectedChatData,
    selectedChatType,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
    typingUsers,
    setReplyMessage,
  } = useAppStore();
  const socket: any = useSocket();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | any>("");
  const [tooltipVisibleIndex, setTooltipVisibleIndex] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editMessage, setEditMessage] = useState<IMessage>(InitialMessage);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES,
          { id: selectedChatData._id },
          {
            withCredentials: true,
          }
        );
        if (response.status == 200) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (e) {}
    };
    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          {
            withCredentials: true,
          }
        );
        if (response.status == 200) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (e) {}
    };
    if (selectedChatData._id) {
      if (selectedChatType == "contact") {
        getMessages();
      } else if (selectedChatType == "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !(tooltipRef.current as any).contains(event.target)
      ) {
        setTooltipVisibleIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToMessage = (messageId: string | any) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      element.classList.add("message-highlight");
      setTimeout(() => {
        element.classList.remove("message-highlight");
      }, 2000);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      const results = selectedChatMessages.filter(
        (msg: any) =>
          msg.messageType === "text" &&
          !msg.isDelete &&
          msg.content?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }, 500);
  };

  const searchInput = () => {
    return (
      <div className="flex justify-center">
        <div className="w-1/3 p-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search messages"
            className="p-2 border rounded"
          />
          {searchResults.map((msg) => (
            <div
              key={msg._id}
              onClick={() => scrollToMessage(msg._id)}
              className="cursor-pointer hover:bg-purple-500 p-2 rounded"
            >
              {msg.content}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleEmoji = async (emoji: any) => {
    console.log(emoji);
  };

  const renderMessages = () => {
    let lastDate: any = null;
    return selectedChatMessages.map((message: any) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div
          key={message._id}
          ref={(el) => {
            messageRefs.current[message._id] = el;
          }}
        >
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.createdAt).format("LL")}
            </div>
          )}
          {selectedChatType == "contact" && renderDMMessages(message)}
          {selectedChatType == "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url: any) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (data: any) => {
        setFileDownloadProgress(Math.round((100 * data.loaded) / data.total));
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
  };

  const actionToolTipRender = (message: any) => {
    return (
      tooltipVisibleIndex === message._id && (
        <div
          ref={tooltipRef}
          className={`absolute ml-2 top-1/2 -translate-y-1/2 bg-white text-gray-800 shadow-md rounded-md z-20 flex flex-col px-2 py-1 border border-gray-200 w-max
          ${
            message.sender !== selectedChatData._id ? "right-full" : "left-full"
          }
            `}
        >
          <button
            className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() => {
              setTooltipVisibleIndex(null);
              setReplyMessage(message);
            }}
          >
            <GoReply className="text-base" />
            <span>Reply</span>
          </button>
          {message.sender !== selectedChatData._id && (
            <>
              {message.messageType === "text" && (
                <>
                  <button
                    className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      setTooltipVisibleIndex(null);
                    }}
                  >
                    <IoCopy className="text-base" />
                    <span>Copy</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    onClick={() => {
                      setTooltipVisibleIndex(null);
                      setEditMessage(message);
                      setOpenEditModal(true);
                    }}
                  >
                    <BiSolidEditAlt className="text-base text-blue-500" />
                    <span>Edit</span>
                  </button>
                </>
              )}
              <button
                className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  setTooltipVisibleIndex(null);
                  if (selectedChatType == "contact") {
                    socket.emit("deleteDMMessage", {
                      sender: userInfo._id,
                      recipient: selectedChatData._id,
                      messageId: message._id,
                    });
                  } else if (selectedChatType == "channel") {
                    socket.emit("deleteCHMessage", {
                      sender: userInfo._id,
                      channelId: selectedChatData._id,
                      messageId: message._id,
                    });
                  }
                }}
              >
                <MdDelete className="text-base text-red-500" />
                <span>Delete</span>
              </button>

              {message.messageType === "file" && (
                <button
                  className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  onClick={() => {
                    setTooltipVisibleIndex(null);
                    downloadFile(message.fileUrl);
                  }}
                >
                  <IoMdArrowRoundDown className="text-base text-blue-500" />
                  <span>Download</span>
                </button>
              )}
            </>
          )}
        </div>
      )
    );
  };

  const tooltipVisible = (message: any) => {
    // if (message.sender == selectedChatData._id) {
    //   return setTooltipVisibleIndex(null);
    // }
    setTooltipVisibleIndex(
      tooltipVisibleIndex === message._id ? null : message._id
    );
  };

  const renderRepliedMessage = (data: IMessage) => {
    const replyMessage: IMessage = selectedChatMessages.find(
      (message: IMessage) => {
        return message._id == data.replyId;
      }
    );
    return replyMessage;
  };
  const renderDMMessages = (message: IMessage) => {
    return (
      <div
        className={`${
          message.sender == selectedChatData._id ? "text-left" : "text-right"
        } my-5`}
      >
        {message.messageType == "text" && (
          <>
            {!message.isDelete &&
              message.isEdit &&
              message.sender !== selectedChatData._id && (
                <div className="opacity-70 italic pointer-events-none select-none cursor-not-allowed">
                  Edited
                </div>
              )}
            {message.replyId && (
              <div
                onClick={() => scrollToMessage(message.replyId)}
                style={{ borderBottom: "none" }}
                className={`opacity-70 italic cursor-pointer text-sm max-w-[30%] border border-[#8417ff]/50 p-3 rounded overflow-hidden whitespace-nowrap truncate
                   ${
                     message.sender == selectedChatData._id
                       ? "mr-auto border-[#ffffff]/50"
                       : "ml-auto border-[#8417ff]/50"
                   }`}
              >
                {renderRepliedMessage(message).content ? (
                  renderRepliedMessage(message).content
                ) : (
                  <>
                    {checkIfAudio(renderRepliedMessage(message).fileUrl) ? (
                      <>
                        <span className="flex items-center justify-end">
                          <FaMicrophone />
                          Voice Message
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center justify-end">
                          <GrAttachment />
                          Attachment
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            <div
              className={`${
                message.sender == selectedChatData._id
                  ? "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
                  : "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              } ${
                message.isDelete
                  ? "opacity-50 line-through italic pointer-events-none select-none cursor-not-allowed p-2"
                  : "p-4"
              } border inline-block rounded my-1 max-w-[50%] break-words cursor-pointer relative`}
            >
              {!message.isDelete && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${
                    message.sender === selectedChatData._id
                      ? "-right-10"
                      : "-left-12"
                  }`}
                >
                  <BsThreeDotsVertical
                    onClick={() => tooltipVisible(message)}
                    className="cursor-pointer text-gray-400 hover:text-white transition"
                  />
                  <RiEmojiStickerLine
                    onClick={() => setEmojiPickerOpen(true)}
                    className="cursor-pointer text-gray-400 hover:text-white transition"
                  />
                </div>
              )}
              {message.isDelete ? "Deleted" : message.content}

              {actionToolTipRender(message)}
              {
                message.reaction && (
                  <span className="absolute top-12 -right-1 text-white text-sm font-semibold rounded-full px-1.5 py-0.5 leading-none">
                  {message.reaction}
                  </span>
                )
              }
            </div>
          </>
        )}
        {message.messageType == "file" && (
          <div
            className={`${
              message.sender == selectedChatData._id
                ? "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
                : "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            } ${
              message.isDelete
                ? "opacity-50 line-through italic pointer-events-none select-none cursor-not-allowed"
                : ""
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words cursor-pointer relative`}
          >
            {!message.isDelete && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${
                  message.sender === selectedChatData._id
                    ? "-right-10"
                    : "-left-12"
                }`}
              >
                <BsThreeDotsVertical
                  onClick={() => tooltipVisible(message)}
                  className="cursor-pointer text-gray-400 hover:text-white transition"
                />
                <RiEmojiStickerLine
                  onClick={() => setEmojiPickerOpen(true)}
                  className="cursor-pointer text-gray-400 hover:text-white transition"
                />
              </div>
            )}
            {message.isDelete && "Deleted"}
            {!message.isDelete && checkIfImage(message.fileUrl) && (
              <div className="cursor-pointer">
                <img
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                  src={`${HOST}/${message.fileUrl}`}
                  height={300}
                  width={300}
                />
              </div>
            )}
            {!message.isDelete && checkIfDocument(message.fileUrl) && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>
                  {message.fileUrl && message.fileUrl.split("/").pop()}
                </span>
              </div>
            )}
            {!message.isDelete && checkIfAudio(message.fileUrl) && (
              <VoiceMessage message={message} />
            )}
            {actionToolTipRender(message)}
          </div>
        )}
        <div className="text-xs text-gray-600">
          {" "}
          {moment(message.createdAt).format("LT")}
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message: any) => {
    return (
      <div
        className={`${
          message.sender._id !== userInfo._id ? "text-left" : "text-right"
        } mt-5`}
      >
        {message.messageType == "text" && (
          <div
            className={`${
              message.sender._id == userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}
          >
            {message.content}
          </div>
        )}
        {message.messageType == "file" && (
          <div
            className={`${
              message.sender._id == userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div className="cursor-pointer">
                <img
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                  src={`${HOST}/${message.fileUrl}`}
                  height={300}
                  width={300}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id !== userInfo._id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.createdAt).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1">
            {moment(message.createdAt).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              value={editMessage.content}
              onChange={(e) =>
                setEditMessage({ ...editMessage, content: e.target.value })
              }
            />
          </div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={() => {
                if (selectedChatType == "contact") {
                  socket.emit("updateDMMessage", {
                    sender: userInfo._id,
                    recipient: selectedChatData._id,
                    messageId: editMessage._id,
                    content: editMessage.content,
                  });
                } else if (selectedChatType == "channel") {
                  socket.emit("updateDMMessage", {
                    sender: userInfo._id,
                    channelId: selectedChatData._id,
                    messageId: editMessage._id,
                  });
                }
                setOpenEditModal(false);
                setEditMessage(InitialMessage);
              }}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
        {searchInput()}
        {renderMessages()}
        {selectedChatType === "contact" &&
          typingUsers[selectedChatData._id] && (
            <div className="ml-2 text-sm text-center italic text-white/60 animate-pulse">
              {`${selectedChatData.firstName || "User"} is recording/typing...`}
            </div>
          )}
        <div ref={scrollRef} />
        {showImage && (
          <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
            <div>
              <img
                src={`${HOST}/${imageUrl}`}
                className="h-[80vh] w-full bg-cover"
              />
            </div>
            <div className="flex gap-5 fixed top-0 mt-5">
              <button
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(imageUrl)}
              >
                <IoMdArrowRoundDown />
              </button>

              <button
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => {
                  setImageUrl(null);
                  setShowImage(false);
                }}
              >
                <IoCloseSharp />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MessageContainer;
