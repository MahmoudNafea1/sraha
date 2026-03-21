import { Router } from "express";
import * as authserves from "./auth.serves.js";
import { validation } from "../../middelware/validation.middelware.js";
import * as Validators from "./auth.validation.js";

const router = Router({ caseSensitive: true, strict: true });

router.patch(
  "/confirm-email",
  validation(Validators.confirmEmailVali),
  authserves.confirmEmail,
);

router.post(
  "/signup",
  validation(Validators.signupValidation),
  authserves.signup,
);

router.post("/login", validation(Validators.loginValidation), authserves.login);

router.post(
  "/forgot-password",
  validation(Validators.forgotPassword),
  authserves.forgotPassword,
);

router.post(
  "/verify-forgot-password",
  validation(Validators.verifyForgotPassword),
  authserves.verifyForgotPassword,
);

router.post(
  "/rest-forgot-password",
  validation(Validators.restForgotPassword),
  authserves.restForgotPassword,
);

router.post(
  "/auth/gmail",
  validation(Validators.authWithGmailVali),
  authserves.signupWithGmail,
);

export default router;
