const express = require("express");
const router = express.Router();
const contacts = require("../../model/index.js");
const contactSchema = require("../../model/contactsSchema");
const contactsCtrl = require("../../controllers/contacts");

router.get("/", contactsCtrl.listContacts);

router.get("/:contactId", contactsCtrl.getContactById);

router.post("/", contactsCtrl.addContact);

router.delete("/:contactId", contactsCtrl.removeContact);

router.patch("/:contactId", contactsCtrl.updateContact);

router.patch("/:contactId/favorite", contactsCtrl.updateStatusContact);

module.exports = router;
