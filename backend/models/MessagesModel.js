import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Users",
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Users",
            required: false
        },
        messageType: {
            type: String,
            enum:["text","file"],
            required: true,
        },
        content: {
            type: String,
            required: function (){
                return this.messageType == 'text';
            },
        },
        isDelete : {
           type:Boolean,
           default:false
        },
        isEdit : {
            type:Boolean,
            default:false
        },
        fileUrl: {
            type: String,
            required: function (){
                return this.messageType == 'file';
            },
        },
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model("Messages", messageSchema);
export default Message;