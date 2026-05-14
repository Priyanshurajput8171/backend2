import { Router } from 'express'
import { registerUser , loginUser ,loggedOutUser ,refreshAccessToken} from '../controllers/user.controller.js'

import { upload } from '../middlewares/multer.middleware.js';
import { authVerify } from '../middlewares/auth.middleware.js';

const userRouter = Router()

userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount : 1
    },
    {
        name: "coverImage",
        maxCount : 1
    }
]), registerUser);
userRouter.route("/login").post(loginUser);

//secure routes

userRouter.route("/logout").post(authVerify,loggedOutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)

export default userRouter