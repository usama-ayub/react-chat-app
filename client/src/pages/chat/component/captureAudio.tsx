import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from 'wavesurfer.js'

function CaptureAudio({ hide }: any) {
//   const { selectedChatData, selectedChatType, userInfo } = useAppStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<any>(null);
  const [waveform, setWaveform] = useState<any>(null);
  const [renderAudio, setRenderAudio] = useState<any>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const waveformRef = useRef<any>(null);

      useEffect(() => {
      let interval:any;
      if(isRecording){
        interval = setInterval(()=>{
            setRecordingDuration((prevDuration)=>{
                setTotalDuration(prevDuration+1)
                return prevDuration+1;
            })
        },1000)
      }
      return ()=>{
        clearInterval(interval)
      }
    },[isRecording])

  useEffect(() => {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ccc',
        progressColor: '#4a9eff',
        cursorColor:"#7ae3c3",
        barWidth:2,
        height:30,
      });
      setWaveform(wavesurfer);
      wavesurfer.on("finish", ()=>{
        setIsPlaying(false);
      });
      return ()=>{
        wavesurfer.destroy();
      }
    }, []);

    useEffect(() => {
      if(waveform) handleStartRecording()
    },[waveform])

const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
  
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioRef.current.srcObject = stream;
  
      const chunks: BlobPart[] = [];
  
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        setRecordedAudio(audio);
        waveform.load(audioURL);
      };
      mediaRecorder.start();
    }).catch((error) => {
      console.error("Error accessing microphone:", error);
    });
  };


const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const audioChunks: BlobPart[] = [];
  
      // Attach listeners BEFORE stopping
      mediaRecorderRef.current.addEventListener("dataavailable", (event: BlobEvent) => {
        audioChunks.push(event.data);
      });
  
      mediaRecorderRef.current.addEventListener("stop", () => {
        const blob = new Blob(audioChunks, { type: "audio/mp3" }); // note: "audio/webm" or "audio/ogg" is more supported
        const audioFile = new File([blob], "recording.mp3");
  
        setRenderAudio(audioFile);
      });
  
      mediaRecorderRef.current.stop(); // NOW safe to call stop
      setIsRecording(false);
      waveform.stop();
  
      // Stop microphone stream
    //   const tracks = audioRef.current?.srcObject?.getTracks();
    //   tracks?.forEach((track:any) => track.stop());
    }
  };

  useEffect(()=>{
     if(recordedAudio){
        const updatePlaybackTime = ()=>{
            setCurrentPlaybackTime(recordedAudio.currentTime);
        }
        recordedAudio.addEventListener("timeupdate",updatePlaybackTime);
        return ()=>{
            recordedAudio.removeEventListener("timeupdate",updatePlaybackTime);
          }
     }
  },[recordedAudio])

  const handlePlayRecoring = () => {
    if(recordedAudio){
        waveform.stop();
        waveform.play();
        recordedAudio.play();
        setIsPlaying(true);
    }
  };
  const handlePauseRecoring = () => {
    waveform.stop();
        recordedAudio.pause();
        setIsPlaying(false);
  };


  const handleSendRecoring = async () => {};

  const formateTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={() => hide()}
        />
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center rounded-full drop-shadow-lg bg-search-input-container">
        {isRecording ? (
          <div className="text-red-500 animate-pulse 2-60 text-center">
            Recording <span>{recordingDuration}s</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay onClick={handlePlayRecoring} />
                ) : (
                  <FaStop onClick={handlePauseRecoring} />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-60" ref={waveformRef} hidden={isRecording} />
        {recordedAudio && isPlaying && (<span>{formateTime(currentPlaybackTime)}</span>)}
        {recordedAudio && !isPlaying && (<span>{formateTime(totalDuration)}</span>)}
        <audio ref={audioRef} hidden />
        <div className="mr-4">
          {!isRecording ? (
            <FaMicrophone
              className="text-red-500"
              onClick={handleStartRecording}
            />
          ) : (
            <FaPauseCircle
              className="text-red-500"
              onClick={handleStopRecording}
            />
          )}
        </div>
        <div>
          <MdSend
            className="text-panel-header-icon cursor-pointer mr-4"
            title="Send"
            onClick={handleSendRecoring}
          />
        </div>
      </div>
    </div>
  );
}

export default CaptureAudio;
