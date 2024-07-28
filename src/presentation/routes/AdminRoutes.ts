import { Router } from "express";
import { AdminContrller } from "../controllers/AdminController";

const router = Router();

router.post('/admin/signup',AdminContrller.signUp);
router.post('/admin/signin',AdminContrller.signIn);
router.put('/admin/blockUser/:userId',AdminContrller.blockUser)
router.put('/admin/unblockUser/:userId',AdminContrller.unblockUser)
router.delete("/admin/deleteUser/:userId", AdminContrller.deleteUser);

router.put('/admin/blockVendor/:vendorId',AdminContrller.blockVendor)
router.put('/admin/unblockVendor/:vendorId',AdminContrller.unblockVendor)
router.put('/admin/approveKYC/:vendorId',AdminContrller.approveKYC)
router.get('/admin/:vendorId/properties',AdminContrller.getPropertiesByVendor)
router.get('/admin/dashboard-counts', AdminContrller.getDashboardCounts);
router.get('/admin/revenues', AdminContrller.getAllRevenues);


export default router;