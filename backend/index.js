import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/AuthRoutes.js';
import contactRoutes from './routes/ContactRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import channelRoutes from './routes/ChannelRoutes.js';

import setupSocket from './socket.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
   origin: [process.env.ORIGIN],
   methods:["GET", "POST", "PUT", "PATCH", "DELETE"],
   credentials: true,
}));

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));
app.use("/uploads/recordings", express.static("uploads/recordings"));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/channel', channelRoutes);

const server = app.listen(port ,()=>{
    console.log(`Server is running at http://localhost:${port}`)
});

setupSocket(server);

mongoose.connect(databaseURL)
.then(()=>console.log('DB Connection Successful.'))
.catch((err)=>console.error(err.message))