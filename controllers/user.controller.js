"use strict";
const model = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");
const CONFIG = require("../config/config");

// -------------------------------------------------------------
// 📌 REGISTER USER
// -------------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, gender } = req.body;

    if (!name || !email || !password) {
      return ReE(res, "Required fields missing: name, email, password", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email exists
    const existingUser = await model.User.findOne({
      where: { email: normalizedEmail, isDeleted: false },
    });

    if (existingUser) {
      return ReE(res, "User with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await model.User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      // 🔹 UPDATED → role as STRING
      role: role || "applicant",

      gender: gender || null,
    });

    return ReS(res, { success: true, userId: user.id }, 201);
  } catch (error) {
    console.error("Register User Error:", error);
    return ReE(res, error.message, 500);
  }
};

// -------------------------------------------------------------
// 📌 LOGIN USER
// -------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return ReE(res, "Email and password are required", 400);

    const normalizedEmail = email.trim().toLowerCase();

    const user = await model.User.findOne({
      where: { email: normalizedEmail, isDeleted: false },
    });

    if (!user) return ReE(res, "Invalid email or password", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return ReE(res, "Invalid email or password", 401);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      CONFIG.jwt_encryption,
      { expiresIn: CONFIG.jwt_expiration }
    );

    return ReS(res, { success: true, token, role: user.role }, 200);
  } catch (error) {
    console.error("Login Error:", error);
    return ReE(res, error.message, 500);
  }
};

// -------------------------------------------------------------
// 📌 GET ALL USERS
// -------------------------------------------------------------
const getAllUsers = async (req, res) => {
  try {
    const users = await model.User.findAll({
      where: { isDeleted: false },
    });

    return ReS(res, users, 200);
  } catch (error) {
    console.error("Get All Users Error:", error);
    return ReE(res, error.message, 500);
  }
};

// -------------------------------------------------------------
// 📌 GET USER BY ID
// -------------------------------------------------------------
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await model.User.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) return ReE(res, "User not found", 404);

    return ReS(res, user, 200);
  } catch (error) {
    console.error("Get User Error:", error);
    return ReE(res, error.message, 500);
  }
};

// -------------------------------------------------------------
// 📌 UPDATE USER
// -------------------------------------------------------------
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = req.body;
    updates.updatedAt = new Date();

    const user = await model.User.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) return ReE(res, "User not found", 404);

    await user.update(updates);

    return ReS(res, { success: true, message: "User updated successfully" }, 200);
  } catch (error) {
    console.error("Update User Error:", error);
    return ReE(res, error.message, 500);
  }
};

// -------------------------------------------------------------
// 📌 DELETE USER (HARD DELETE NOW)
// -------------------------------------------------------------
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await model.User.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) return ReE(res, "User not found", 404);

    // 🔥 HARD DELETE
    await user.destroy();

    return ReS(res, { success: true, message: "User deleted permanently" }, 200);
  } catch (error) {
    console.error("Delete User Error:", error);
    return ReE(res, error.message, 500);
  }
};

// -------------------------------------------------------------
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
