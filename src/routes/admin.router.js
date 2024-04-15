import { Router } from "express";
import {
  getAllAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/allAdmins").get(verifyJWT, getAllAdmin)

export default router;
