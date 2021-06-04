const jwt = require("jsonwebtoken");
const Users = require("../model/users");
const { HttpCode } = require("../helpers/constants");
require("dotenv").config();
const SECRET = process.env.SECRET;
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");
const sgMail = require("../helpers/sendgrid");

const emailVerify = async (req, res, next) => {
  const { verificationToken } = req.params;
  const verifiedUsed = await Users.getUserVerify(verificationToken);
  await Users.updateVerifyToken(verifiedUsed._id);
  await Users.updateVerify(verifiedUsed._id);

  verifiedUsed
    ? res.status(200).json({
        status: "ok",
        code: 200,
        ResponseBody: {
          message: "Verification successful",
        },
      })
    : res.status(404).json({
        status: "Not Found",
        code: 404,
        ResponseBody: {
          message: "User not found",
        },
      });
};
const repeatEmailVerify = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      status: "Error",
      code: 400,
      ResponseBody: {
        message: "missing required field email",
      },
    });
  }
  const user = await Users.findByEmail(email);
  if (user && !user.verify && user.verifyToken) {
    const verifyMessage = {
      to: email,
      from: "vurtnevk@gmail.com",
      subject: "Verify your email",
      text: "To verify your email follow this link",
      html: `<a>http://localhost:3000/users/verify/${user.verifyToken}</a>`,
    };
    await sgMail
      .send(verifyMessage)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    res.status(200).json({
      status: "ok",
      ResponseBody: {
        message: "Verification email sent",
      },
    });
  }
  if (user && user.verify) {
    res.status(400).json({
      status: "Bad Request",
      ResponseBody: {
        message: "Verification has already been passed",
      },
    });
  }
};

const reg = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Users.findByEmail(email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        data: "Conflict",
        message: "Email already use",
      });
    }
    const newUser = await Users.create(req.body);

    const verifyMessage = {
      to: newUser.email,
      from: "vurtnevk@gmail.com",
      subject: "Verify your email",
      text: "To verify your email follow this link",
      html: `<a>http://localhost:3000/users/verify/${newUser.verifyToken}</a>`,
    };
    await sgMail
      .send(verifyMessage)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);

    if (!user.verify) {
      return res.status(400).json({
        status: "error",
        code: HttpCode.BAD_REQUEST,
        message: "Your email is not verifyed yet",
        data: "Please verify your email",
      });
    }

    const isValidPassword = await user?.validPassword(password);

    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        data: "UNAUTHORIZED",
        message: "Email or password is wrong",
      });
    }
    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET, { expiresIn: "2h" });
    await Users.updateToken(id, token);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  const id = req.user.id;
  await Users.updateToken(id, null);

  return res.status(HttpCode.NO_CONTENT).json({});
};

const currentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        data: "UNAUTHORIZED",
        message: "Not authorized",
      });
    }
    const id = req.user.id;
    const currentUser = await Users.findById(id);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        email: currentUser.email,
        subscription: currentUser.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};
const updateUser = async (req, res, next) => {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  const { path: temporaryName, originalname } = req.file;
  const { user, file } = req;
  const avatarsDir = path.join(process.cwd(), "public", "avatars");
  const filePathName = path.join(avatarsDir, `${prefix}_${originalname}`);
  const img = await Jimp.read(temporaryName);
  await img
    .autocrop()
    .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
    .writeAsync(temporaryName);
  await fs.rename(temporaryName, filePathName, (err) => {
    if (err) {
      console.log(err);
    }
  });

  await Users.updateAvatar(user._id, filePathName);
  const userWithUpdtAvatar = await Users.findById(user._id);
  return res.status(200).json({
    status: "ok",
    code: HttpCode.OK,
    user: {
      avatarURL: userWithUpdtAvatar.avatarURL,
    },
  });
};

module.exports = {
  reg,
  login,
  logout,
  currentUser,
  updateUser,
  emailVerify,
  repeatEmailVerify,
};
