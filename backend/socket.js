import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for(const [userId, socketId] of userSocketMap.entries()){
        if(socketId == socket.id){
            userSocketMap.delete(userId);
            break;
        }
    }
  };

  const sendMessage = async (message)=>{
    console.log(message)
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
    .populate("sender","id email firstName lastName image color replyId")
    .populate("recipient","id email firstName lastName image color replyId");
    
    if(recipientSocketId){
      io.to(recipientSocketId).emit("recieveMessage", messageData)
    }

    if(senderSocketId){
      io.to(senderSocketId).emit("recieveMessage", messageData)
    }
  }

  const sendChannelMessage = async (message)=>{
    const {sender, content, channelId, messageType, fileUrl} = message;

    const createdMessage = await Message.create({
      sender,
      recipient:null,
      content,
      fileUrl,
      messageType
    });

    const messageData = await Message.findById(createdMessage._id)
    .populate("sender","id email firstName lastName image color")
    .exec();
    
    await Channel.findByIdAndUpdate(channelId, {
      $push:{messages:createdMessage._id}
    });

    const channel = await Channel.findById(channelId).populate('members');

    const finalData = {...messageData._doc, channelId: channel._id};
    
    if(channel && channel.members){
      channel.members.forEach((member)=>{
        const memberSocketId = userSocketMap.get(member._id.toString());
        if(memberSocketId){
          io.to(memberSocketId).emit('recieve-channel-message', finalData)
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if(adminSocketId){
        io.to(adminSocketId).emit('recieve-channel-message', finalData)
      }
    }
  }
  const broadcastUserStatus = () => {
    const onlineUsers = Array.from(userSocketMap.keys());
    io.emit("userStatusUpdate", { onlineUsers });
  };

  const startTyping = (socket) =>  ({ recipientId }) =>{
    const recipientSocketId = userSocketMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing", { senderId: socket.handshake.query.userId });
    }
  }
  const stopTyping = (socket) =>  ({ recipientId }) => {
    const recipientSocketId = userSocketMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("stopTyping", { senderId: socket.handshake.query.userId });
    }
  }
  const deleteDMMessage = async (message)=>{
    const {messageId, sender, recipient} = message
    const senderSocketId = userSocketMap.get(sender);
    const recipientSocketId = userSocketMap.get(recipient);

    const updatedMessage = await Message.findByIdAndUpdate(messageId,{
      isDelete:true
    });

    const messageData = await Message.findById(updatedMessage._id)
    .populate("sender","id email firstName lastName image color")
    .populate("recipient","id email firstName lastName image color");
    
    if(recipientSocketId){
      io.to(recipientSocketId).emit("deleteDMMessage", messageData)
    }

    if(senderSocketId){
      io.to(senderSocketId).emit("deleteDMMessage", messageData)
    }
  }
  const updateDMMessage = async (message)=>{
    const {messageId, sender, recipient, content} = message
    const senderSocketId = userSocketMap.get(sender);
    const recipientSocketId = userSocketMap.get(recipient);

    const updatedMessage = await Message.findByIdAndUpdate(messageId,{
      isEdit:true,
      content:content
    });

    const messageData = await Message.findById(updatedMessage._id)
    .populate("sender","id email firstName lastName image color")
    .populate("recipient","id email firstName lastName image color");
    
    if(recipientSocketId){
      io.to(recipientSocketId).emit("updateDMMessage", messageData)
    }

    if(senderSocketId){
      io.to(senderSocketId).emit("updateDMMessage", messageData)
    }
  }
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      broadcastUserStatus();
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User Id not provided during connection");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("typing", startTyping(socket));
    socket.on("stopTyping", stopTyping(socket));
    socket.on("deleteDMMessage", deleteDMMessage);
    socket.on("updateDMMessage", updateDMMessage);
    socket.on("disconnect", () => {
      disconnect(socket);
      broadcastUserStatus();
    });    
  });
};

export default setupSocket;
