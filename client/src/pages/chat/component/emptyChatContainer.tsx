import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "react-lottie";

function EmptyChatContainer() {
  return (
    <div className="flex-1 md:bg-[#1b1c25] md:flex flex-col justify-center items-center hidden duration-100 transition-all">
      <Lottie
        isClickToPauseDisabled={true}
        height={200}
        width={200}
        options={animationDefaultOptions}
      />
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
        <h3 className="poppins-medium">
          Hi <span className="text-purple-500">!</span>Welcome to
          <span className="text-purple-500"> Syncrouns </span> Chat App
          <span className="text-purple-500">.</span>
        </h3>
      </div>
    </div>
  );
}

export default EmptyChatContainer;
