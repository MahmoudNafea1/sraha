import joi from "joi";
import { generalFialds } from "../../middelware/validation.middelware.js";

export const loginValidation = {
  body: joi
    .object()
    .keys({
      email: generalFialds.email.required(),
      password: generalFialds.password.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const signupValidation = {
  body: loginValidation.body
    .append({
      fullname: generalFialds.fullname.required(),
      confirmPassword: generalFialds.confirmPassword.required(),
      phone: generalFialds.phone.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const confirmEmailVali = {
  body: joi
    .object()
    .keys({
      email: generalFialds.email.required(),
      otp: generalFialds.otp.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const authWithGmailVali = {
  body: joi
    .object()
    .keys({
      IdToken: joi.string().required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const forgotPassword = {
  body: joi.object().keys({
    email: generalFialds.email.required(),
  }),
};

export const verifyForgotPassword = {
  body: forgotPassword.body.append({
    otp: generalFialds.otp.required(),
  }),
};

export const restForgotPassword = {
  body: verifyForgotPassword.body.append({
    password: generalFialds.password.required(),
    confirmPassword: generalFialds.confirmPassword.required(),
  }),
};
