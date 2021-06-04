const { object, string, boolean } = require("yup");

const schemaCreateUser = object({
  email: string().required(),
  password: string().required(),
});

const schemaLoginUser = object({
  email: string().required(),
  password: string().required(),
});

const validate = (schema, obj, next) => {
  const { error } = schema.validate(obj);

  if (error) {
    const [{ message }] = error.details;

    return next({
      status: 400,
      message: "Not valid data",
    });
  }
  next();
};

module.exports.createUser = (req, res, next) => {
  console.log("<<<<<<<<<<<<<<<<<<HERE RICHED HERE>>>>>>>>>>>");
  console.log(req.body);

  return validate(schemaCreateUser, req.body, next);
};

module.exports.loginUser = (req, res, next) => {
  return validate(schemaLoginUser, req.body, next);
};
