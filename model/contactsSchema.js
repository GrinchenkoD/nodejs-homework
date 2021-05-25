const { object, string } = require("yup");

const contactsSchema = object({
  name: string().required("missing required name field"),
  email: string().email().required("missing required name field"),
  phone: string().required("missing required name field"),
});

module.exports = contactsSchema;
