import joi from "joi";

import { generalFialds } from "../../middelware/validation.middelware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/cloud.multer.js";

export const shareProfile = {
  params: joi.object().keys({
    userid: generalFialds.id.required(),
  }),
};

export const updateBasicInfo = {
  body: joi
    .object()
    .keys({
      fullname: generalFialds.fullname,
      phone: generalFialds.phone,
      gender: generalFialds.gender,
      _id: generalFialds.id,
    })
    .required(),
};

export const freezeAccount = {
  params: joi.object().keys({
    userid: generalFialds.id,
  }),
};

export const restoreAccount = {
  params: joi.object().keys({
    userid: generalFialds.id.required(),
  }),
};

export const deleteAccount = {
  params: joi.object().keys({
    userid: generalFialds.id.required(),
  }),
};

export const logout = {
  body: joi.object().keys({
    flag: joi
      .string()
      .valid(...Object.values(logoutEnum))
      .default(logoutEnum.stayLoggedIn),
  }),
};

export const updatePassword = {
  body: logout.body.append({
    oldPassword: generalFialds.password.required(),
    password: generalFialds.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFialds.confirmPassword.required(),
  }),
};

export const profileImages = {
  files: joi

    .object()
    .keys({
      fieldname: generalFialds.file.fieldname.valid("images").required(),
      originalname: generalFialds.file.originalname.required(),
      encoding: generalFialds.file.encoding.required(),
      mimetype: generalFialds.file.mimetype
        .valid(...Object.values(fileValidation.image))
        .required(),
      // finalPath: generalFialds.file.finalPath,
      destination: generalFialds.file.destination.required(),
      filename: generalFialds.file.filename.required(),
      path: generalFialds.file.path.required(),
      size: generalFialds.file.size.required(),
    })
    .required(),
};

export const coverImages = {
  files: joi
    .array()
    .items(
      joi
        .object()
        .keys({
          fieldname: generalFialds.file.fieldname.valid("images").required(),
          originalname: generalFialds.file.originalname.required(),
          encoding: generalFialds.file.encoding.required(),
          mimetype: generalFialds.file.mimetype
            .valid(...Object.values(fileValidation.image))
            .required(),
          // finalPath: generalFialds.file.finalPath,
          destination: generalFialds.file.destination.required(),
          filename: generalFialds.file.filename.required(),
          path: generalFialds.file.path.required(),
          size: generalFialds.file.size.required(),
          // temBasspath: generalFialds.file.temBasspath,
        })
        .required(),
    )
    .min(1)
    .max(2)
    .required(),
};

//  certificate: joi
//         .array()
//         .ordered(
//           joi
//             .object()
//             .keys({
//               fieldname: generalFialds.file.fieldname.valid("certificate"),
//               originalname: generalFialds.file.originalname,
//               encoding: generalFialds.file.encoding,
//               mimetype: generalFialds.file.mimetype.valid(
//                 ...Object.values(fileValidation.image),
//               ),
//               finalPath: generalFialds.file.finalPath,
//               destination: generalFialds.file.destination,
//               filename: generalFialds.file.filename,
//               path: generalFialds.file.path,
//               size: generalFialds.file.size,
//               temBasspath: generalFialds.file.temBasspath,
//             })
//             .required(),
//         )
//         .length(1)
//         .required(),
