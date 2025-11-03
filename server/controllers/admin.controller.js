import logger from "../config/logger.js";
import User from "../models/User.model.js";
import Space from "../models/Space.model.js";
import Booking from "../models/Booking.model.js";
import AdminActionLog from "../models/AdminActionLog.model.js";
import {
  suspendUserValidation,
  reactivateUserValidation,
  approveSpaceValidation,
  rejectSpaceValidation,
} from "../validators/admin.validator.js";

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationMeta = ({ page, limit, totalDocs, totalPages, hasNextPage, hasPrevPage }) => ({
  page,
  limit,
  totalItems: totalDocs,
  totalPages,
  hasNextPage,
  hasPrevPage,
});

export const listUsers = async (req, res) => {
  const filters = {};
  const { page, limit, skip } = parsePagination(req.query);

  if (req.query.role) {
    filters.role = req.query.role;
  }

  if (req.query.status) {
    filters.isActive = req.query.status === "active";
  }

  try {
    const [users, totalUsers] = await Promise.all([
      User.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("fullname email phoneNumber role permissions isActive createdAt onboardingCompleted authProvider"),
      User.countDocuments(filters),
    ]);

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "list_users",
      entityType: "user",
      metadata: {
        filters,
        page,
        limit,
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalItems: totalUsers,
          totalPages: Math.max(Math.ceil(totalUsers / limit), 1),
          hasNextPage: page * limit < totalUsers,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Admin list users failed", {
      error: error.message,
      adminId: req.user?._id,
    });
    res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
    });
  }
};

export const approveSpace = async (req, res) => {
  const { error, value } = approveSpaceValidation.validate(req.body ?? {});
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const spaceId = req.params.id;

  if (!spaceId) {
    return res.status(400).json({
      success: false,
      message: "Space ID is required",
    });
  }

  try {
    const space = await Space.findById(spaceId).populate("hostId", "email role");

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    if (space.status === "approved") {
      return res.status(409).json({
        success: false,
        message: "Space is already approved",
      });
    }

    const previousStatus = {
      status: space.status,
      moderation: space.moderation,
      isActive: space.isActive,
    };

    space.status = "approved";
    space.isActive = true;
    space.moderation = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reason: value.notes ?? null,
    };

    await space.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "approve_space",
      entityType: "space",
      entityId: space._id,
      metadata: {
        notes: value.notes ?? null,
        previousStatus,
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Space approved successfully",
      data: {
        id: space._id,
        status: space.status,
        isActive: space.isActive,
        moderation: space.moderation,
      },
    });
  } catch (error) {
    logger.error("Admin approve space failed", {
      error: error.message,
      adminId: req.user?._id,
      spaceId,
    });
    res.status(500).json({
      success: false,
      message: "Unable to approve space",
    });
  }
};

export const rejectSpace = async (req, res) => {
  const { error, value } = rejectSpaceValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const spaceId = req.params.id;

  if (!spaceId) {
    return res.status(400).json({
      success: false,
      message: "Space ID is required",
    });
  }

  try {
    const space = await Space.findById(spaceId).populate("hostId", "email role");

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    if (space.status === "rejected") {
      return res.status(409).json({
        success: false,
        message: "Space is already rejected",
      });
    }

    const previousStatus = {
      status: space.status,
      moderation: space.moderation,
      isActive: space.isActive,
    };

    space.status = "rejected";
    space.isActive = false;
    space.moderation = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reason: value.reason,
    };

    await space.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "reject_space",
      entityType: "space",
      entityId: space._id,
      metadata: {
        reason: value.reason,
        previousStatus,
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Space rejected successfully",
      data: {
        id: space._id,
        status: space.status,
        isActive: space.isActive,
        moderation: space.moderation,
      },
    });
  } catch (error) {
    logger.error("Admin reject space failed", {
      error: error.message,
      adminId: req.user?._id,
      spaceId,
    });
    res.status(500).json({
      success: false,
      message: "Unable to reject space",
    });
  }
};

export const suspendUser = async (req, res) => {
  const { error, value } = suspendUserValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const targetUserId = req.params.id;

  if (!targetUserId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (req.user._id.toString() === targetUserId) {
    return res.status(400).json({
      success: false,
      message: "Admins cannot suspend themselves",
    });
  }

  try {
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.suspension?.isSuspended) {
      return res.status(409).json({
        success: false,
        message: "User is already suspended",
      });
    }

    user.suspension = {
      isSuspended: true,
      reason: value.reason,
      details: value.details ?? null,
      resumeAt: value.resumeAt ?? null,
      suspendedBy: req.user._id,
      suspendedAt: new Date(),
    };
    user.isActive = false;

    await user.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "suspend_user",
      entityType: "user",
      entityId: user._id,
      metadata: {
        reason: value.reason,
        details: value.details ?? null,
        resumeAt: value.resumeAt ?? null,
        previousState: {
          isActive: true,
        },
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "User suspended successfully",
      data: {
        id: user._id,
        suspension: user.suspension,
        isActive: user.isActive,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Admin suspend user failed", {
      error: error.message,
      adminId: req.user?._id,
      targetUserId,
    });
    res.status(500).json({
      success: false,
      message: "Unable to suspend user",
    });
  }
};

export const reactivateUser = async (req, res) => {
  const { error, value } = reactivateUserValidation.validate(req.body ?? {});
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const targetUserId = req.params.id;

  if (!targetUserId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.suspension?.isSuspended) {
      return res.status(409).json({
        success: false,
        message: "User is not currently suspended",
      });
    }

    const previousSuspension = { ...user.suspension.toObject?.() ?? user.suspension };

    user.suspension = {
      isSuspended: false,
      reason: null,
      details: value.reason ?? null,
      suspendedBy: null,
      suspendedAt: null,
      resumeAt: null,
    };
    user.isActive = true;

    await user.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "reactivate_user",
      entityType: "user",
      entityId: user._id,
      metadata: {
        previousSuspension,
        notes: value.reason ?? null,
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "User reactivated successfully",
      data: {
        id: user._id,
        suspension: user.suspension,
        isActive: user.isActive,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Admin reactivate user failed", {
      error: error.message,
      adminId: req.user?._id,
      targetUserId,
    });
    res.status(500).json({
      success: false,
      message: "Unable to reactivate user",
    });
  }
};

export const listSpaces = async (req, res) => {
  const filters = {};
  const { page, limit } = parsePagination(req.query);

  if (req.query.status) {
    filters.isActive = req.query.status === "active";
  }

  try {
    const result = await Space.paginate(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: "hostId",
        select: "fullname email phoneNumber role",
      },
      lean: true,
    });

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "list_spaces",
      entityType: "space",
      metadata: {
        filters,
        page,
        limit,
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: {
        spaces: result.docs,
        pagination: buildPaginationMeta(result),
      },
    });
  } catch (error) {
    logger.error("Admin list spaces failed", {
      error: error.message,
      adminId: req.user?._id,
    });
    res.status(500).json({
      success: false,
      message: "Unable to retrieve spaces",
    });
  }
};

export const listBookings = async (req, res) => {
  const filters = {};
  const { page, limit } = parsePagination(req.query);

  if (req.query.status) {
    filters.status = req.query.status;
  }

  try {
    const result = await Booking.paginate(filters, {
      page,
      limit,
      sort: { startTime: -1 },
      populate: [
        { path: "userId", select: "fullname email role" },
        { path: "spaceId", select: "title location hostId" },
      ],
      lean: true,
    });

    await AdminActionLog.create({
      adminId: req.user._id,
      action: "list_bookings",
      entityType: "booking",
      metadata: {
        filters,
        page,
        limit,
      },
      method: req.method,
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: {
        bookings: result.docs,
        pagination: buildPaginationMeta(result),
      },
    });
  } catch (error) {
    logger.error("Admin list bookings failed", {
      error: error.message,
      adminId: req.user?._id,
    });
    res.status(500).json({
      success: false,
      message: "Unable to retrieve bookings",
    });
  }
};
