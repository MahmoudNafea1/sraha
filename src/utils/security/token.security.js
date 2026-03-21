import jwt from "jsonwebtoken";
import { roleenum, Usermodel } from "../../DB/models/users.model.js";
import * as DBservice from "../../DB/db.serves.js";
import { nanoid } from "nanoid";
import { Tokenmodel } from "../../DB/models/Token.model.js";
export const signaturelevelEnum = { bearer: "Bearer", system: "system" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };
export const logoutEnum = {
  signoutFromAll: "sign-out from All",
  signout: "sign-out",
  stayLoggedIn: "stay logged in  ",
};

export const generateToken = ({
  payload = {},
  secret_Key = process.env.ACCESS_USER_TOKEN_SECRET_KEY,
  options = { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
}) => {
  return jwt.sign(payload, secret_Key, options);
};

export const verifyToken = ({
  token = "",
  secret_Key = process.env.ACCESS_USER_TOKEN_SECRET_KEY,
}) => {
  return jwt.verify(token, secret_Key);
};

export const getsignature = ({
  signaturelevel = signaturelevelEnum.bearer,
} = {}) => {
  const signatureKey = {
    access_signature: undefined,
    refresh_signature: undefined,
  };

  switch (signaturelevel) {
    case signaturelevelEnum.system:
      signatureKey.access_signature =
        process.env.ACCESS_SYSTEM_TOKEN_SECRET_KEY;
      signatureKey.refresh_signature =
        process.env.REFRESH_SYSTEM_TOKEN_SECRET_KEY;
      break;

    default:
      signatureKey.access_signature = process.env.ACCESS_USER_TOKEN_SECRET_KEY;
      signatureKey.refresh_signature =
        process.env.REFRESH_USER_TOKEN_SECRET_KEY;
      break;
  }
  return signatureKey;
};

export const decodedToken = async ({
  next,
  authorization = "",
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [bearerKey, token] = authorization?.split(" ") || [];
  if (!bearerKey || !token) {
    return next(new Error("missing token parts", { cause: 401 }));
  }

  const signatureKey = getsignature({ signaturelevel: bearerKey });

  const decoded = verifyToken({
    token: token,
    secret_Key:
      tokenType === tokenTypeEnum.access
        ? signatureKey.access_signature
        : signatureKey.refresh_signature,
  });

  if (!decoded?._id) {
    return next(new Error("in-valid token", { cause: 400 }));
  }
  if (
    decoded.jti &&
    (await DBservice.findOne({
      model: Tokenmodel,
      filter: { jti: decoded.jti },
    }))
  ) {
    return next(new Error("in-valid login credentials", { cause: 401 }));
  }
  const user = await DBservice.findById({
    model: Usermodel,
    _id: decoded._id,
  });

  if (!user) {
    return next(new Error("not register account", { cause: 404 }));
  }

  if (user.changecredentialsTime?.getTime() > decoded.iat * 1000) {
    return next(new Error("In-valid login credentials ", { cause: 401 }));
  }
  return { user, decoded };
};

export const generateLoginCredentials = async ({ user } = {}) => {
  let signatureKey = getsignature({
    signaturelevel:
      user.role != roleenum.user
        ? signaturelevelEnum.system
        : signaturelevelEnum.bearer,
  });
  const jwtid = nanoid();
  const access_token = generateToken({
    payload: { _id: user._id },
    secret_Key: signatureKey.access_signature,
    options: { jwtid, expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    secret_Key: signatureKey.refresh_signature,
    options: { jwtid, expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
  });

  return { access_token, refresh_token };
};

export const createRovokeToken = async ({ req } = {}) => {
  await DBservice.create({
    model: Tokenmodel,
    data: [
      {
        jti: req.decoded.jti,
        expiresIn:
          req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        userid: req.decoded._id,
      },
    ],
  });
};
