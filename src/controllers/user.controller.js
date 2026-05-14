import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { userModel } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

 
const generateAccessAndRefreshToken = async(userId) => {
   try {
     const user = await userModel.findById(userId);
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshToken();

     user.refreshToken = refreshToken ; 
     await user.save({validateBeforeSave : false})

     return {accessToken ,refreshToken}
   } catch (error) {
    // throw new apiError(500,"Something went wrong while generating access and refresh token");
    console.error("ERROR:", error.message);
   }
}

const registerUser = asyncHandler(async(req,res) =>{
    const {username ,email, fullName ,password} = req.body;
    
    if([email , username , fullName , password].some(field => !field?.trim())){
        throw new apiError(401,{
            message : "all labels are required"
        })
    }

    const existedUser = await userModel.findOne({
        $or : [{email},{username}]
    })

    if(existedUser){
        res.status(409).json({
            message : "User already exists"
        })
    }

    // local path from multer
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files?.coverImage[0]?.path || "";

    if(!avatarLocalPath || !coverImgLocalPath){
        throw new apiError(401,{
            message : "avatar is required"
        })
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImgLocalPath);
    if (!avatar || !coverImage) {
        throw new apiError(400, "Avatar and coverImage upload failed");
    }
    
    const user = await userModel.create({
       username,
       email,
       fullName,
       avatar : avatar.url,
       coverImage : coverImage.url || "",
       password   
    })
    const createUser = await userModel.findById(user._id).select("-password");

    if(!createUser){
        res.status(500).json({
            success : false,
            message : "user is not created"
        })
    }
    res.status(201).json(
        new apiResponse(200,createUser ,"User succesfully Registered")
    )

})

const loginUser = asyncHandler(async(req,res) => {
    const {username , password} = req.body ;
    if(!username || !password){
        res.status(400).json({
            success : false,
            message : "username and password is required"
        })
    }
    const user = await userModel.findOne({username});
    if(!user){
        res.status(400).json({
            success : false,
            message : "User not found"
        })
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );
    if(!isPasswordCorrect){
        throw new apiError(401,{
            message : "Password is not correct"
        })
    }
    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);
  
    const loggedInUser = await userModel
   .findById(user._id)
   .select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,{
                user : loggedInUser , accessToken , refreshToken
            },
            "User logged In successfully"
        )
    )

})

const loggedOutUser = asyncHandler(async(req,res) => {
    await userModel.findByIdAndUpdate(req.user?._id,
        {
            $set :{
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json( new apiResponse(200,{} , "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken ; 

    if(!incomingRefreshToken){
        throw new apiError(401,"Refresh Token not accessable")
    }

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await userModel.findById(decodedToken._id)
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401,"Refresh token not matched");
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        res.status(200)
        .cookie("accessToken",accessToken , options)
        .cookie("refreshToken",newRefreshToken , options)
        .json(
            new apiResponse(200,
                {
                    accessToken,
                    refreshToken : newRefreshToken,
                },
                "Token access succesfully"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message ,"Invalid refresh token")
    }
})

export {registerUser , loginUser , loggedOutUser , refreshAccessToken}