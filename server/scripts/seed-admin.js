import mongoose from "mongoose";
import "dotenv/config";

import { logger } from "../config/logger.js";
import User from "../models/User.model.js";

const requiredEnv = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_PHONE"];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  logger.error(
    `Missing required environment variables: ${missing.join(", ")}. Aborting admin seed.`
  );
  process.exit(1);
}

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;

async function connect() {
  if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI must be defined to run the admin seed script.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function upsertAdmin() {
  const permissions = [
    "users:read",
    "spaces:read",
    "bookings:read",
    "users:write",
    "spaces:write",
    "bookings:write",
  ];

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

  if (!existingAdmin) {
    await User.create({
      fullname: "Seeded Admin",
      email: ADMIN_EMAIL,
      phoneNumber: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: "admin",
      permissions,
      isActive: true,
      emailVerified: true,
    });
    logger.info(`Admin account created: ${ADMIN_EMAIL}`);
    return;
  }

  existingAdmin.fullname = existingAdmin.fullname || "Seeded Admin";
  existingAdmin.phoneNumber = ADMIN_PHONE;
  existingAdmin.password = ADMIN_PASSWORD;
  existingAdmin.role = "admin";
  existingAdmin.permissions = permissions;
  existingAdmin.isActive = true;
  existingAdmin.emailVerified = true;

  await existingAdmin.save();
  logger.info(`Admin account updated: ${ADMIN_EMAIL}`);
}

async function run() {
  try {
    await connect();
    await upsertAdmin();
  } catch (error) {
    logger.error("Failed to seed admin", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
