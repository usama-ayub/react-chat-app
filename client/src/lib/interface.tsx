export interface IMessage {
    isDelete: boolean;
    isEdit: boolean;
    _id: string;
    sender: string;
    recipient: string;
    messageType: string;
    content?: string;
    fileUrl?: string;
    createdAt: string; 
    updatedAt: string;
    replyId?: string;
    reaction?: string;
    __v: number;
}