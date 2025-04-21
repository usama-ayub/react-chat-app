import Message from "../models/MessagesModel.js";
import { renameSync, unlinkSync, mkdirSync } from "fs";

export const getMessages = async (request, response) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;
    if (!user1 && !user2) return response.status(400).send("Both user are requied.");

    const messages = await Message.find({
        $or:[
            {sender: user1, recipient:user2},
            {sender: user2, recipient:user1}
        ]
    }).sort({timestamps:1})

    return response.status(200).json({messages});
  } catch (error) {
    return response.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (request, response) => {
    try {
     if (!request.file) return response.status(404).send("File is required.");
     const date = Date.now();
     let fileDr = `uploads/files/${date}`;
     let fileName = `${fileDr}${request.file.originalname}`;
     mkdirSync(fileDr, {recursive:true});
     renameSync(request.file.path, fileName);
     return response.status(200).json({filePath: fileName});
    } catch (error) {
      return response.status(500).send("Internal Server Error");
    }
  };

export const uploadAudio = async (request, response) => {
    try {
      console.log(request.file)
      console.log(request.audio)
     if (!request.file) return response.status(404).send("Audio is required.");
     const date = Date.now();
     let fileName = `uploads/recordings/${date}${request.file.originalname}`;
     renameSync(request.file.path, fileName);
     return response.status(200).json({filePath: fileName});
    } catch (error) {
      return response.status(500).send("Internal Server Error");
    }
  };
