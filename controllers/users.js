const jwt = require("jsonwebtoken");
const Users = require("../model/users");
const { HttpCode } = require("../helpers/constants");
require("dotenv").config();
const SECRET = process.env.SECRET;
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");

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

// const updateUser = async (req, res, next) => {
//   try {
//     const id = req.user.id;
//     const avatarUrl = await saveAvatarToStatic(req);
//     await Users.updateAvatar(id, avatarUrl);

//     return res.json({
//       status: "success",
//       code: HttpCode.OK,
//       data: {
//         ...req.body,
//         avatarUrl,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// const saveAvatarToStatic = async (req) => {
//   const id = req.user.id;
//   const AVATARS_OF_USERS = process.env.AVATARS_OF_USERS;
//   const pathFile = req.file.path;
//   const avatarName = req.file.originalname;
//   const folderForUserAvatar = id;
//   await createFolderIsExist(path.join(AVATARS_OF_USERS, folderForUserAvatar));
//   await fs.rename(
//     pathFile,
//     path.join(AVATARS_OF_USERS, folderForUserAvatar, avatarName)
//   );
//   const avatarURL = path.normalize(path.join(id, avatarName));

//   try {
//     await fs.unlink(
//       path.join(process.cwd(), AVATARS_OF_USERS, req.user.avatar)
//     );
//   } catch (err) {
//     console.log(err.message);
//   }

//   return avatarURL;
// };

module.exports = { reg, login, logout, currentUser, updateUser };
