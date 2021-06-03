const multer = require("multer");
const path = require("path");
require("dotenv").config();

const UPLOAD_DIR = path.join(process.cwd(), "public", "avatars");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    cb(null, `${prefix}__${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("image")) {
      cb(null, true);

      return;
    }
    cb(null, false);
  },
});

module.exports = upload;
