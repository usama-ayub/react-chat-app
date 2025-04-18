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
  } = useAppStore();
  const { contacts, isChannel } = props;
  const handleClick = (contact: any) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
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
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.image ? (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`
                        ${
                          selectedChatData &&
                          selectedChatData._id == contact._id
                            ? "bg-[#ffffff22] border border-white/70"
                            : getColor(contact.color)
                        }
                        uppercase h-10 w-10 text-lg flex items-center justify-center rounded-full`}
                  >
                    {contact.firstName
                      ? contact.firstName.split("").shift()
                      : contact.email.split("").shift()}
                  </div>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isChannel ? (
              <span>{contact.name}</span>
            ) : (
              <>
                <span>
                  {contact.firstName
                    ? `${contact.firstName} ${contact.lastName}`
                    : contact.email}
                </span>

                <div className="relative inline-block">
                  <IoIosNotifications className="text-neutral-400 font-light text-opacity-90 hover:text-neutral-100 cursor-pointer transition-all duration-300 text-2xl" />
                  {/* {count > 0 && ( */}
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none">
                      1
                    </span>
                  {/* )} */}
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
