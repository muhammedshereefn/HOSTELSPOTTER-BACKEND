import { Request, Response } from "express";
import { AdminSignUpUseCase } from "../../application/use-cases/admin/AdminSignUpUseCase";
import { AdminSignInUseCase } from "../../application/use-cases/admin/AdminSignInUseCase";
import { AdminRepository } from "../../infrastructure/repositories/AdminRepository";
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { BlockUserUseCase } from "../../application/use-cases/admin/BlockUserUseCase";
import { UnblockUserUseCase } from "../../application/use-cases/admin/UnblockUserUseCase";
import { DeleteUserUseCase } from "../../application/use-cases/admin/DeleteUserUseCase";
import { VendorRepository } from "../../infrastructure/repositories/VendorRepository";
import { BlockVendorUseCase } from "../../application/use-cases/admin/BlockVendorUseCase";
import { UnblockVendorUseCase } from "../../application/use-cases/admin/UnblockVendorUseCase";
import { PropertyRepository } from "../../infrastructure/repositories/PropertyRepository";
import { GetPropervatiesByVendorUseCase } from "../../application/use-cases/admin/GetPropertiesByVendorUseCase";
import { NodemailerService } from "../../infrastructure/mail/NodemailerService";
const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const propertyRepository = new PropertyRepository();

const nodemailerService = new NodemailerService();

export class AdminContrller {
    static async signUp(req:Request,res:Response) {
        const { name,email,password } = req.body;

        try {
            const signUpUseCase = new AdminSignUpUseCase(adminRepository);
            await signUpUseCase.execute(name,email,password);
            res.status(201).send('Admin registerd successsfully');
        } catch (error) {
            res.status(400).json("Got error on register",)

        }
    }

    static async signIn(req:Request,res:Response){
        const {email,password} = req.body;

        try {
            const signInUseCase = new AdminSignInUseCase(adminRepository)
            const token = await signInUseCase.execute(email,password);
            res.status(200).json({token});
        } catch (error) {
            res.status(400).json("error on signin")
        }
    }

    static async blockUser(req: Request, res: Response) {
        const {userId} = req.params;

        try {
            const blockUserUseCase = new BlockUserUseCase(userRepository);
            await blockUserUseCase.execute(userId);
            res.status(200).send("User blocked successfully")
        } catch (error) {
            res.status(400).json("Error on blocking user")
        }
    }


    static async unblockUser(req: Request, res: Response) {
        const { userId } = req.params;
    
        try {
          const unblockUserUseCase = new UnblockUserUseCase(userRepository);
          await unblockUserUseCase.execute(userId);
          res.status(200).json({ message: "User unblocked successfully" });
        } catch (error) {
          res.status(400).json({ message: "Got error on unblock user" });
        }
      }

    
      static async deleteUser(req: Request, res: Response) {
        const {userId}=req.params;

        try {
            const deleteUserUseCase = new DeleteUserUseCase(userRepository)
            await deleteUserUseCase.execute(userId);
            res.status(200).json({message:"User deleted succeesfully"})
        } catch (error) {
            console.log("error deleting user:" ,error);
            res.status(500).json({message:"Internal server error"})
            
        }
      }

      static async blockVendor(req:Request,res:Response){
        const {vendorId} = req.params;

        try {
            const blockVendorUseCase = new BlockVendorUseCase(vendorRepository)
            await blockVendorUseCase.execute(vendorId)
            res.status(200).send("User blocked successfullly")
        } catch (error) {
            res.status(400).json("Error on blocking user")
        }
      }

      static async unblockVendor(req:Request,res:Response){
        const {vendorId} = req.params;

        try {
            const unblockVendorUseCase = new UnblockVendorUseCase(vendorRepository)
            await unblockVendorUseCase .execute(vendorId);
            res.status(200).json({message:"Vendor unblocked successfully"})
        } catch (error) {
            res.status(400).json({message:"got error on unblock vendor"})
        }
      }

      static async approveKYC(req: Request, res: Response){
        const {vendorId} = req.params;


        try {
            await vendorRepository.updateKycStatus(vendorId,'success');
            const vendor = await vendorRepository.findVendorById(vendorId);
            console.log(vendor?.email,'---------------------');
            if(vendor && vendor.email){
                await nodemailerService.sendApprovalEmail(vendor.email);
            }
            
            res.status(200).json({message:'KYC approved successfully'})
        } catch (error) {
            console.error('Error approving KYC:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
      }


      static async getPropertiesByVendor(req: Request, res: Response) {
        const { vendorId } = req.params;
        console.log('vendorid:',vendorId);
        

        try {
            const getPropertiesByVendorUseCase = new GetPropervatiesByVendorUseCase(propertyRepository);
            const properties = await getPropertiesByVendorUseCase.execute(vendorId);
            res.status(200).json(properties);
        } catch (error) {
            console.error('Error fetching properties:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

}