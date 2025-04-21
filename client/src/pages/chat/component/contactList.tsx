import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HOST } from "@/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { IoIosNotifications  } from "react-icons/io";

function ContactList(props: any) {
  const {
    selectedChatData,
    setSelectedChatData,
    selectedChatType,
    setSelectedChatType,
    setSelectedChatMessages,
    directMessagesNotifications,
    onlineUsers,
    setDirectMessagesNotifications
  } = useAppStore();
  const { contacts, isChannel } = props;
  const handleClick = (contact: any) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);

    const updatedNotifications = { ...directMessagesNotifications };
    delete updatedNotifications[contact._id];
    setDirectMessagesNotifications(updatedNotifications);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  const renderUserStatus = (contact:any) => {
    const status = onlineUsers.includes(contact._id);
    return (
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          status ? "bg-green-500" : "bg-gray-400"
        }`}
        title={status ? "Online" : "Offline"}
      ></span>
    );
  };

  return (
    <div className="mt-5">
      {contacts.map((contact: any) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id == contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden relative">
                {contact.image ? (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`${
                      selectedChatData && selectedChatData._id === contact._id
                        ? "bg-[#ffffff22] border border-white/70"
                        : getColor(contact.color)
                    } uppercase h-10 w-10 text-lg flex items-center justify-center rounded-full`}
                  >
                    {contact.firstName
                      ? contact.firstName.charAt(0)
                      : contact.email.charAt(0)}
                  </div>
                )}
                {renderUserStatus(contact)}
              </Avatar>
            )}

            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}

            {isChannel ? (
              <>
              <span>{contact.name}<br/>
              <span className="text-[12px]">{contact.members.length} Members</span>
              </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span>
                    {contact.firstName
                      ? `${contact.firstName} ${contact.lastName}`
                      : contact.email}
                  </span>
                  
                  <div className="relative inline-block">
                    <IoIosNotifications className="text-neutral-400 font-light text-opacity-90 hover:text-neutral-100 cursor-pointer transition-all duration-300 text-2xl" />
                    {directMessagesNotifications[contact._id] && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none">
                        {directMessagesNotifications[contact._id]}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
