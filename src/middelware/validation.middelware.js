import { Types } from "mongoose";
import { asyncHandler } from "../utils/response.js";
import joi from "joi";
import { genderenum } from "../DB/models/users.model.js";

export const generalFialds = {
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["net", "com", "edu"] },
  }),
  password: joi
    .string()
    .pattern(
      new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,16}$/),
    ),
  fullname: joi
    .string()
    .pattern(new RegExp(/^[A-Za-z]{1,19}\s[A-Za-z]{1,19}$/))
    .min(2)
    .max(20)
    .messages({
      "string.min": "min name length is 2 char",
      "any.required": "Fullname is mandatory",
    }),

  confirmPassword: joi.string().valid(joi.ref("password")),
  otp: joi.string().pattern(new RegExp(/^\d{6}/)),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  gender: joi.string().valid(...Object.values(genderenum)),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) || helper.message("invalid objectId ");
  }),
  file: {
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    finalPath: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().positive().required(),
    temBasspath: joi.string().required(),
  },
};

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationError.push({
          key,
          details: validationResult.error.details.map((ele) => {
            return { message: ele.message, path: ele.path[0] };
          }),
        });
      }
    }
    if (validationError.length) {
      return res
        .status(400)
        .json({ error_message: "valedation error", validationError });
    }
    return next();
  });
};

// export const validationQuery = (schema) => {
//   return asyncHandler(async (req, res, next) => {
//     const validationResult = schema.validate(req.query, {
//       abortEarly: false,
//     });
//     if (validationResult.error) {
//       return res
//         .status(400)
//         .json({ error_message: "valedation error", validationResult });
//     }
//     return next();
//   });
// };
