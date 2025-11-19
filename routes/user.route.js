"use strict";
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Register User
router.post("/register", userController.registerUser);

// Login User
router.post("/login", userController.loginUser);

// Get All Users
router.get("/all", userController.getAllUsers);

// Get User By ID
router.get("/:id", userController.getUserById);

// Update User
router.patch("/update/:id", userController.updateUser);

// Delete User (Soft Delete from controller)
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
