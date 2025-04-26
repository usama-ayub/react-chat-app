import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3*24*60*60*1000;

const createToken = (email, userId)=>{
    return jwt.sign({email, userId}, process.env.JWT_KEY,{expiresIn:maxAge})
};

export const signup = async (request, response) => {
    try {
      const {email, password} = request.body;
      if(!email || !password){
        return response.status(400).send("Email and Password is required");
      }
      const user = await User.create({email,password});
      response.cookie('jwt',createToken(email, user.id),{
        maxAge,
        secure:true,
        sameSite: "None"
      })
      const userData = user.toObject();
      delete userData.password;
      delete userData.updatedAt;
      return response.status(201).json(userData)
    } catch (error) {
        return response.status(500).send("Internal Server Error");
    }
}


export const login = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required");
    }
    const user = await User.findOne({ email });
    if (!user) return response.status(400).send("Email not found.");
    const auth = await compare(password, user.password);
    if (!auth) return response.status(400).send("Password is incorrect.");
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    const userData = user.toObject();
    delete userData.password;
    delete userData.updatedAt;
    return response.status(201).json(userData);
  } catch (error) {
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (request, response) => {
  try {
    const user = await User.findById(request.userId).select('-password -updatedAt');
    if(!user) return response.status(404).send("User not found."); 
    return response.status(200).send(user);
  } catch (error) {
      return response.status(500).send("Internal Server Error");
  }
}

export const updateProfile = async (request, response) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;
    if (!firstName || !lastName || !color)
      return response
        .status(404)
        .send("Firstname Lastname and color is required.");
    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileStatus: true },
      { new: true, runValidators: true }
    );
    return response.status(200).send(userData);
  } catch (error) {
    return response.status(500).send("Internal Server Error");
  }
};


export const addProfileImage = async (request, response) => {
  try {
    if (!request.file) return response.status(404).send("File is required.");
    const date = Date.now();
    let fileName = `uploads/profiles/${date}${request.file.originalname}`;
    renameSync(request.file.path, fileName);
    const { userId } = request;
    const userData = await User.findByIdAndUpdate(
      userId,
      { image:fileName },
      { new: true, runValidators: true }
    );
    return response.status(200).json({image: userData.image});
  } catch (error) {
    console.log(error)
    return response.status(500).send("Internal Server Error");
  }
};

export const removeProfileImage = async (request, response) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);
    if(!user) return response.status(404).send("User not found.");
    if(user.image) {
      unlinkSync(user.image);
    }
    user.image = null;
    await user.save();
    return response.status(200).send("Profile remove successfully.");
  } catch (error) {
    return response.status(500).send("Internal Server Error");
  }
};

export const logout = async (request, response) => {
  try {
response.cookie('jwt','',{maxAge:1,secure:true, sameSite:"None"})
    return response.status(200).send("Logout successfully.");
  } catch (error) {
    return response.status(500).send("Internal Server Error");
  }
};