const express = require("express");
const router = express.Router();
const validate = require("../../model/userSchema");
const userController = require("../../controllers/users");
const guard = require("../../helpers/guard");
const upload = require("../../helpers/upload");

router.post("/signup", validate.createUser, userController.reg);
router.post("/login", validate.loginUser, userController.login);
router.post("/logout", guard, userController.logout);
router.get("/current", guard, userController.currentUser);
router.patch(
  "/avatars",
  [guard, upload.single("avatar")],
  userController.updateUser
);

module.exports = router;
