import mongoose from "mongoose";
import Message from "../models/MessagesModel.js";
import User from "../models/UserModel.js";

export const searchContacts = async (request, response) => {
  try {
    const { searchTerm } = request.body;
    if (!searchTerm)
      return response.status(400).send("Search Term is requied.");

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[/]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        {
          _id: { $ne: request.userId },
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        },
      ],
    });

    return response.status(200).json({contacts});
  } catch (error) {
    console.log(error)
    return response.status(500).send("Internal Server Error");
  }
};


export const getContactsForDMList = async (request, response) => {
  try {
    let {userId} = request;
    userId = new mongoose.Types.ObjectId(userId);
    const contacts = await Message.aggregate([
      {
        $match : {
          $or:[{sender: userId}, {recipient:userId}]
        },
      },
      {
        $sort:{timestamps: -1}
      },
      {
        $group:{
          _id:{
            $cond:{
              if:{$eq:["$sender", userId]},
              then:"$recipient",
              else:"$sender"
            }
          },
          lastMessageTime: {$first : "$timestamps"}
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"_id",
          foreignField:"_id",
          as:"contactInfo"
        }
      },
      {
        $unwind:"$contactInfo"
      },
      {
         $project:{
          _id:1,
          lastMessageTime:1,
          email:"$contactInfo.email",
          firstName:"$contactInfo.firstName",
          lastName:"$contactInfo.lastName",
          color:"$contactInfo.color",
          image:"$contactInfo.image"
         }
      },
      {
        $sort:{lastMessageTime:-1}
      }
    ])

    return response.status(200).json({contacts});
  } catch (error) {
    console.log(error)
    return response.status(500).send("Internal Server Error");
  }
};


export const getAllContacts = async (request, response) => {
  try {
    const users = await User.find({
      _id: { $ne: request.userId },
      profileStatus: { $eq: true }
    },  "firstName lastName _id");
    const contacts = users.map((user)=>(
      {
        label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
        value: user._id
     }
    ))
    return response.status(200).json({contacts});
  } catch (error) {
    console.log(error)
    return response.status(500).send("Internal Server Error");
  }
};
