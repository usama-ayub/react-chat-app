import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import animationData from "@/assets/lottie-json.json"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const colors = ['border-[1px] bg-[#ff006e] text-[#712c4a57] border-[#712c4a57]','border-[1px] bg-[#712c4a57] text-[#ff006e] border-[#ff006e]'];

export const getColor = (color:any)=>{return colors[color]};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData:animationData,
  // rendererSettings: {
  //   preserveAspectRatio: 'xMidYMid slice'
  // }
};