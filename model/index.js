// const contacts = require('./contacts.json')
const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");
const contactSchema = require("./contactsSchema");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath, "utf8");
  return JSON.parse(data);
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(({ id }) => id.toString() === contactId);
  return contact;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(({ id }) => id.toString() === contactId);
  if (!contact) return;
  const filteredContacts = contacts.filter(
    ({ id }) => id.toString() !== contactId
  );
  await fs.writeFile(
    contactsPath,
    JSON.stringify(filteredContacts, null, 2),
    "utf8"
  );
  return contact;
};

const addContact = async (body) => {
  const validData = await contactSchema.isValid(body);
  if (!validData) {
    return {
      message: "Data is not valid. Check it and try again ",
    };
  }

  const contacts = await listContacts();
  const id = nanoid();
  const newContact = { id, ...body };
  const newContacts = [...contacts, newContact];
  await fs.writeFile(
    contactsPath,
    JSON.stringify(newContacts, null, 2),
    "utf8"
  );
  return newContact;
};

const updateContact = async (contactId, body) => {
  const validData = await contactSchema.isValid(body);
  if (!validData) {
    return {
      message: "Data is not valid. Check it and try again ",
    };
  }

  const contacts = await listContacts();
  const newContacts = contacts.map((contact) => {
    return contactId === contact.id ? { ...contact, ...body } : contact;
  });
  await fs.writeFile(
    contactsPath,
    JSON.stringify(newContacts, null, 2),
    "utf8"
  );
  return newContacts;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
