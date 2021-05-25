const express = require("express");
const router = express.Router();
const contacts = require("../../model/index.js");
const contactSchema = require("../../model/contactsSchema");

router.get("/", async (req, res, next) => {
  try {
    const result = await contacts.listContacts();
    return res.json({
      status: "Ok",
      code: 200,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contacts.getContactById(contactId);

    if (!result) {
      return res.status(400).json({
        status: "Error",
        code: 400,
        message: "Not found",
      });
    } else {
      return res.json({
        status: "Ok",
        code: 200,
        data: {
          result,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const validData = await contactSchema.isValid(req.body);
  if (!validData) {
    return res.status(400).json({
      status: "Error",
      code: 400,
      message: "Missing required field",
    });
  }
  try {
    const contact = await contacts.addContact(req.body);
    return res.status(201).json({
      status: "Success",
      code: 201,
      message: "New contact has been added",
      data: {
        contact,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await contacts.removeContact(contactId);

    if (!contact) {
      return res.status(400).json({
        status: "Error",
        code: 404,
        message: "Not found",
      });
    } else {
      return res.json({
        status: "Success",
        code: 200,
        message: "contact deleted",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
