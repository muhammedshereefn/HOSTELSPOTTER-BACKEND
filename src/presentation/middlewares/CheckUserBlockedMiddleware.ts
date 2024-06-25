import { Request,Response,NextFunction } from "express";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";

const userRepository = new UserRepository();

export const CheckUserBlockedMiddleware = async (req:Request,res:Response,next:NextFunction)=>{
    const {email}= req.body;

    
    if(!email){
        return res.status(400).send("Email is required");
    }

    try {
        const user = await userRepository.findUserByEmail(email)

        if(!user){
            return res.status(404).send("User not found")
        }
        
        if(user.isBlocked){
            return res.status(403).send("User is blocked");
        }

        

        next()
    } catch (error) {
        res.status(500).send("Internal server error");
    }
}