const express = require("express");
const router = express.Router();
const contacts = require("../../model/index.js");
const contactSchema = require("../../model/contactsSchema");

router.get("/", async (req, res, next) => {
  console.log("here");

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

  console.log(req);
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
  const { name, email, phone } = req.body;
  const { contactId } = req.params;

  try {
    if (!name || !email || !phone) {
      return res.status(400).json({
        status: "Error",
        code: 400,
        message: "missing fields",
      });
    }
    const result = await contacts.updateContact(contactId, req.body);
    if (result) {
      return res.json({
        status: "Success",
        code: 200,
        message: "Contact updated successfully",
        data: {
          result,
        },
      });
    } else {
      return res.status(404).json({
        status: "Error",
        code: 404,
        message: "Not Found",
      });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
