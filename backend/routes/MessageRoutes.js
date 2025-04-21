import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile, uploadAudio } from "../controllers/MessageController.js";
import multer from "multer";

const messageRoutes = Router();
const upload = multer({dest:"uploads/files"});
const recording = multer({dest:"uploads/recordings"});

messageRoutes.post('/get-messages',verifyToken,getMessages);
messageRoutes.post('/upload-file',verifyToken,upload.single("file"),uploadFile);
messageRoutes.post('/audio-file',verifyToken,recording.single("audio"),uploadAudio);

export default messageRoutes;