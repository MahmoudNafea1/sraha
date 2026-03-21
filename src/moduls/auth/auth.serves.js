import { providerEnum, Usermodel } from "../../DB/models/users.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBserves from "../../DB/db.serves.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { generatEncryption } from "../../utils/security/crypto.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";
import { emailEvent } from "../../utils/events/Email.event.js";
import { customAlphabet } from "nanoid";

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBserves.findOne({
    model: Usermodel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      hashOtp: { $exists: true },
    },
  });
  if (!user) {
    return next(
      new Error("in-valid account or already verified", { cause: 404 }),
    );
  }
  if (!(await compareHash({ plaintext: otp, hashValue: user.hashOtp }))) {
    return next(new Error("in-valid otp"));
  }
  const updatedUser = await DBserves.updateOne({
    model: Usermodel,
    filter: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { hashOtp: true },
      $inc: { __v: 1 },
    },
  });
  return updatedUser.matchedCount
    ? successResponse({ res, status: 200, data: {} })
    : next(new Error("fail to confirm email "));
});

export const signup = asyncHandler(async (req, res, next) => {
  const { fullname, email, password, phone, gender, role } = req.body;
  if (await DBserves.findOne({ model: Usermodel, filter: { email } })) {
    return next(new Error("email exist ", { cause: 409 }));
  } else {
    if (phone && phone.length === 11) {
      const encPhone = await generatEncryption({ plaintext: phone });
      const hashPassword = await generateHash({ plaintext: password });
      const otp = customAlphabet("0123456789", 6)();
      const hashOtp = await generateHash({ plaintext: otp });
      const user = await DBserves.create({
        model: Usermodel,
        data: [
          {
            fullname,
            email,
            password: hashPassword,
            phone: encPhone,
            gender,
            role,
            hashOtp,
          },
        ],
      });
      emailEvent.emit("confirmEmail", { to: email, otp: otp });
      return successResponse({ res, status: 201, data: { user } });
    } else {
      return next(new Error("Phone must be 11 digits", { cause: 400 }));
    }
  }
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBserves.findOne({
    model: Usermodel,
    filter: { email, provider: providerEnum.system },
  });

  if (!user.confirmEmail) {
    return next("please vrify your email");
  }
  if (user.deletedAt) {
    return next("this account is deleted");
  }
  const match = await compareHash({
    plaintext: password,
    hashValue: user.password,
  });

  if (user && match) {
    const credentials = await generateLoginCredentials({ user });
    return successResponse({ res, data: { credentials } });
  } else {
    return next(new Error("in-valied login data", { cause: 401 }));
  }
});

async function verifyGoogleAccount({ idToken } = {}) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_IDS.split(","),
  });

  const payload = ticket.getPayload();
  return payload;
}

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified, name, picture } = await verifyGoogleAccount({
    idToken,
  });

  if (!email_verified) {
    return next(new Error("not verified account ", { cause: 400 }));
  }

  const user = await DBserves.findOne({
    model: Usermodel,
    filter: { email },
  });

  if (user) {
    if (user.provider === providerEnum.google) {
      const credentials = await generateLoginCredentials({ user });
      return successResponse({ res, status: 200, data: { credentials } });
    }

    return next(new Error("email exist ", { cause: 409 }));
  }

  const [newuser] = await DBserves.create({
    model: Usermodel,
    data: [
      {
        fullname: name,
        email,
        picture,
        confirmEmail: Date.now(),
        provider: providerEnum.google,
      },
    ],
  });

  const credentials = await generateLoginCredentials({ user: newuser });
  return successResponse({ res, status: 201, data: { credentials } });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const otp = customAlphabet("0123456789", 6)();
  const user = await DBserves.findOneAndUpdate({
    model: Usermodel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
    },
    data: { forgotPasswordOTP: await generateHash({ plaintext: otp }) },
  });
  if (!user) {
    next(new Error("in-valied account", { cause: 404 }));
  }
  emailEvent.emit("ForGotPassword", {
    to: email,
    subject: "Forgot Password",
    title: "Reset-Password",
    otp,
  });
  return successResponse({ res });
});

export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBserves.findOne({
    model: Usermodel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      forgotPasswordOTP: { $exists: true },
      deletedAt: { $exists: false },
    },
  });

  if (!user) {
    next(new Error("in-valied account", { cause: 404 }));
  }

  if (
    !(await compareHash({ plaintext: otp, hashValue: user.forgotPasswordOTP }))
  ) {
    return next(new Error("in-vaild otp", { cause: 400 }));
  }

  return successResponse({ res });
});

export const restForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await DBserves.findOne({
    model: Usermodel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      forgotPasswordOTP: { $exists: true },
      deletedAt: { $exists: false },
    },
  });

  if (!user) {
    next(new Error("in-valied account", { cause: 404 }));
  }

  if (
    !(await compareHash({ plaintext: otp, hashValue: user.forgotPasswordOTP }))
  ) {
    return next(new Error("in-vaild otp", { cause: 400 }));
  }
  await DBserves.updateOne({
    model: Usermodel,
    filter: { email },
    data: {
      password: await generateHash({ plaintext: password }),
      $unset: { forgotPasswordOTP: 1 },
      changecredentialsTime: new Date(),
    },
  });
  return updateUser.matchedCount
    ? successResponse({ res })
    : next(new Error("fall to rest account password"));
});
