import { asyncHandler } from "../utils/response.js";
import {
  decodedToken,
  tokenTypeEnum,
} from "../utils/security/token.security.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        tokenType,
        next,
        authorization: req.headers.authorization,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  });
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        tokenType: tokenTypeEnum.access,
        next,
        authorization: req.headers.authorization,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    if (!accessRoles.includes(req.user.role)) {
      next(new Error("not authorized account", { cause: 403 }));
    }
    return next();
  });
};
