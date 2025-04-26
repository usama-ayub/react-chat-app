import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL, GET_ALL_CONTACTS, HOST, SEARCH_CONTACT_ROUTES } from "@/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multi-select";
import { Loader } from "@/components/ui/loader";

interface IProps {
  loader:boolean
}

function CreateChannel(props:IProps) {
  const { setSelectedChatType, setSelectedChatData, addChannel } = useAppStore();

  const [newChannelModal, setNewChannelModal] = useState(false);
  const [searchContacts, setSearchContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getAllContact = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACTS, {
          withCredentials: true,
        });
        if (response.status == 200) {
          setAllContacts(response.data.contacts);
        }
      } catch (e) {}
    };
    getAllContact();
  }, []);

  const createChannel = async () => {
    try {
      if(channelName && selectedContacts.length){
        const response = await apiClient.post(CREATE_CHANNEL,{
          name:channelName,
          members:selectedContacts.map((contact:any)=>contact.value),
        }, {
          withCredentials: true,
        });
        if (response.status == 201) {
          setChannelName('');
          setAllContacts([]);
          setNewChannelModal(false);
          addChannel(response.data.channel)
        }
      }
    } catch (e) {}
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {props.loader ? (
              <Loader />
            ) : (
              <FaPlus
                className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
                onClick={() => setNewChannelModal(true)}
              />
            )}
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none text-white mb-3 p-3">
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Please fill up the details for new channel.
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No result found
                </p>
              }
            />
          </div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createChannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateChannel;
