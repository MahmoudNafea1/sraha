import { asyncHandler, successResponse } from "../../utils/response.js";
import {
  decryptEncryption,
  generatEncryption,
} from "../../utils/security/crypto.security.js";
import {
  createRovokeToken,
  generateLoginCredentials,
  logoutEnum,
} from "../../utils/security/token.security.js";
import * as DBservice from "../../DB/db.serves.js";
import { roleenum, Usermodel } from "../../DB/models/users.model.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { Tokenmodel } from "../../DB/models/Token.model.js";
import {
  cloud,
  deleteFolderByPrefix,
  deleteResources,
  destroyFile,
  uploadFile,
  uploadFiles,
} from "../../utils/multer/cloudinary.js";

export const profile = asyncHandler(async (req, res, next) => {
  const user = await DBservice.findById({
    model: Usermodel,
    _id: req.user._id,
    populate: [{ path: "messages" }],
  });

  user.phone = await decryptEncryption({ ciphertext: req.user.phone });
  return successResponse({ res, data: { user } });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userid } = req.params;

  const user = await DBservice.findOne({
    model: Usermodel,
    filter: { _id: userid, confirmEmail: { $exists: true } },
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid account ", { cause: 404 }));
});

export const getNewCredintials = asyncHandler(async (req, res, next) => {
  const credentials = await generateLoginCredentials({ user: req.user });
  return successResponse({ res, data: { credentials } });
});

export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await generatEncryption({ plaintext: req.body.phone });
  }
  const user = await DBservice.findOneAndUpdate({
    model: Usermodel,
    filter: { _id: req.body._id },
    data: req.body,
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid account ", { cause: 404 }));
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userid } = req.params;
  if (userid && req.user.role !== roleenum.admin) {
    return next(new Error("Not authorized account", { cause: 403 }));
  }
  const user = await DBservice.findOneAndUpdate({
    model: Usermodel,
    filter: { _id: userid || req.user._id, deletedAt: { $exists: false } },
    data: {
      deletedAt: Date.now(),
      deletedBy: req.user._id,
      changecredentialsTime: new Date(),
      $unset: { restoredAt: 1, restoredBy: 1 },
    },
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid account ", { cause: 404 }));
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userid } = req.params;

  if (userid && req.user.role !== roleenum.admin) {
    return next(new Error("Not authorized account", { cause: 403 }));
  }
  const user = await DBservice.findOneAndUpdate({
    model: Usermodel,
    filter: {
      _id: userid,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userid },
    },
    data: {
      $unset: { deletedAt: 1, deletedBy: 1 },
      restoredAt: Date.now(),
      restoredBy: req.user._id,
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid account ", { cause: 404 }));
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userid } = req.params;
  if (userid && req.user.role !== roleenum.admin) {
    return next(new Error("Not authorized account", { cause: 403 }));
  }
  const user = await DBservice.deleteOne({
    model: Usermodel,
    filter: { _id: userid, deletedAt: { $exists: true } },
  });
  if (user.deletedCount) {
    await deleteFolderByPrefix({
      prefix: `user/${userid}`,
    });
  }
  return user.deletedCount
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid account ", { cause: 404 }));
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { password, oldPassword, flag } = req.body;
  if (
    !(await compareHash({
      plaintext: oldPassword,
      hashValue: req.user.password,
    }))
  ) {
    return next(new Error("in-valid old Password"));
  }
  for (const historypassword of req.user.oldPassword || []) {
    return next(new Error("this password is used before ", { cause: 409 }));
  }
  let updatedData = {};
  switch (flag) {
    case logoutEnum.signoutFromAll:
      updatedData.changecredentialsTime = new Date();
      break;
    case logoutEnum.signout:
      await createRovokeToken(req);
      break;
    default:
      break;
  }
  const user = await DBservice.findOneAndUpdate({
    model: Usermodel,
    filter: { _id: req.user._id },
    data: {
      password: await generateHash({ plaintext: password }),
      $push: { oldPassword: req.user.password },
      ...updatedData,
    },
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid account ", { cause: 404 }));
});

export const logOut = asyncHandler(async (req, res, next) => {
  const { flag } = req.body;
  let status = 200;
  switch (flag) {
    case logoutEnum.signoutFromAll:
      await DBservice.updateOne({
        model: Usermodel,
        filter: { _id: req.decoded._id },
        data: {
          changecredentialsTime: new Date(),
        },
      });
      break;

    default:
      await createRovokeToken(req);
      status = 201;
      break;
  }

  return successResponse({ res, status, data: {} });
});

export const profileImage = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await uploadFile({
    file: req.file,
    path: `user/${req.user._id}/profile`,
  });

  const user = await DBservice.findOneAndUpdate({
    model: Usermodel,
    filter: { _id: req.user._id },
    data: {
      picture: { secure_url, public_id },
    },
    option: { new: false },
  });
  if (user?.picture?.public_id) {
    await destroyFile({ public_id: user.picture.public_id });
  }
  return successResponse({ res, data: { user } });
});

export const profileCoverImage = asyncHandler(async (req, res, next) => {
  const attachments = await uploadFiles({
    files: req.files,
    path: `user/${req.user._id}/cover`,
  });
  const user = await DBservice.findOneAndUpdate({
    model: Usermodel,
    filter: { _id: req.user._id },
    data: { cover: attachments },
    option: { new: false },
  });
  if (user?.cover?.length) {
    await deleteResources({
      public_ids: user.cover.map((ele) => ele.public_id),
    });
  }

  return successResponse({ res, data: { user } });
});
