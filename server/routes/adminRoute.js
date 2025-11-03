import express from "express";

import { adminOnly } from "../middleware/roles.js";
import {
  listUsers,
  listSpaces,
  listBookings,
  suspendUser,
  reactivateUser,
  approveSpace,
  rejectSpace,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(adminOnly());

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes reachable.",
    timestamp: new Date().toISOString(),
  });
});

router.get("/users", listUsers);
router.get("/spaces", listSpaces);
router.get("/bookings", listBookings);
router.post("/users/:id/suspend", suspendUser);
router.post("/users/:id/reactivate", reactivateUser);
router.post("/spaces/:id/approve", approveSpace);
router.post("/spaces/:id/reject", rejectSpace);

export default router;
