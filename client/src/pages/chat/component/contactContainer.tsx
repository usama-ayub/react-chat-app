import ProfileInfo from "@/pages/profile/profileInfo";
import NewDM from "./newDM";
import { useEffect, useState } from "react";
import { GET_DM_CONTACTS, GET_USER_CHANNELS } from "@/constants";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import ContactList from "./contactList";
import CreateChannel from "./createChannel";

function ContactContainer() {
  const {setDirectMessagesContacts ,directMessagesContacts, channels,setChannels } = useAppStore();
  const [DMContactLoader, setDMContactLoader] = useState<boolean>(false);
  const [CHContactLoader, setCHContactLoader] = useState<boolean>(false);

  useEffect(()=>{
      const getContacts = async ()=>{
        setDMContactLoader(true)
        try {
          const response = await apiClient.get(
            GET_DM_CONTACTS,
            {
              withCredentials: true,
            }
          );
          if (response.status == 200) {
            setDMContactLoader(false)
            setDirectMessagesContacts(response.data.contacts);
          } else {
            setDMContactLoader(false)
          }
        } catch (e) {
          setDMContactLoader(false)
        }
      }

      const getChannels = async ()=>{
        setCHContactLoader(true);
        try {
          const response = await apiClient.get(
            GET_USER_CHANNELS,
            {
              withCredentials: true,
            }
          );
          if (response.status == 200) {
            setCHContactLoader(false);
            setChannels(response.data.channels);
          } else {
            setCHContactLoader(false);
          }
        } catch (e) {
          setCHContactLoader(false);
        }
      }
      getContacts();
      getChannels();
     },[setChannels, setDirectMessagesContacts])
     

    return (
      <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
        <div className="pt-3">
          <Logo/>
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text='Direct Messages'/>
            <NewDM loader={DMContactLoader}/>
          </div>
          <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
              <ContactList contacts={directMessagesContacts} />
          </div>
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text='Channels'/>
            <CreateChannel loader={CHContactLoader} />
          </div>
          <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
              <ContactList contacts={channels} isChannel={true} />
          </div>
        </div>
        <ProfileInfo/>
      </div>
    )
  }
  
  export default ContactContainer;


  const Logo = () => {
    return (
      <div className="flex p-5  justify-start items-center gap-2">
        <svg
          id="logo-38"
          width="78"
          height="32"
          viewBox="0 0 78 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {" "}
          <path
            d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
            className="ccustom"
            fill="#8338ec"
          ></path>{" "}
          <path
            d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
            className="ccompli1"
            fill="#975aed"
          ></path>{" "}
          <path
            d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
            className="ccompli2"
            fill="#a16ee8"
          ></path>{" "}
        </svg>
        <span className="text-3xl font-semibold ">Syncronus</span>
      </div>
    );
  };

  const Title = ({text}:any)=>{
    return (
      <h6 className=" uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">{text}</h6>
    )
  }


