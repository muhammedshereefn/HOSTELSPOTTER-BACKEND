import { Request, Response, NextFunction } from "express";
import { VendorRepository } from "../../infrastructure/repositories/VendorRepository"; // Adjust the path if necessary

const vendorRepository = new VendorRepository();

export const CheckVendorBlockedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email is required");
  }

  try {
    const vendor = await vendorRepository.findVendorByEmail(email);

    if (!vendor) {
      return res.status(404).send("Vendor not found");
    }

    if (vendor.isBlocked) {
      return res.status(403).send("Vendor is blocked");
    }

    next();
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};
