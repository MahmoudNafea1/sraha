import { Router } from "express";
import * as userService from "./user.serves.js";
import {
  authentication,
  authorization,
} from "../../middelware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { roleenum } from "../../DB/models/users.model.js";
import * as validators from "../user/user.validation.js";
import { validation } from "../../middelware/validation.middelware.js";
import { endpoint } from "./user.authorization.js";
import {
  cloudFileupload,
  fileValidation,
} from "../../utils/multer/cloud.multer.js";
const router = Router({ caseSensitive: true, strict: true });

router.get(
  "/",
  authentication(),
  authorization({ accessRoles: [roleenum.user] }),
  userService.profile,
);

router.patch(
  "/profile-image",
  authentication(),
  cloudFileupload({
    validation: fileValidation.image,
  }).single("image"),
  userService.profileImage,
);

router.patch(
  "/profile-cover-image",
  authentication(),
  cloudFileupload({
    validation: fileValidation.image,
  }).array("images", 2),
  validation(validators.coverImages),
  userService.profileCoverImage,
);

router.patch(
  "/",
  authentication(),
  validation(validators.updateBasicInfo),
  userService.updateBasicInfo,
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewCredintials,
);

router.patch(
  "/updatePassword",
  authentication(),
  validation(validators.updatePassword),
  userService.updatePassword,
);

router.post(
  "/logout",
  authentication(),
  validation(validators.logout),
  userService.logOut,
);

router.patch(
  "/:userid/restoreAccount",
  authentication(),
  authorization({ accessRoles: endpoint.restoreAccount }),
  validation(validators.restoreAccount),
  userService.restoreAccount,
);

router.delete(
  "/:userid/deleteAccount",
  authentication(),
  authorization({ accessRoles: endpoint.deleteAccount }),
  validation(validators.freezeAccount),
  userService.deleteAccount,
);

router.delete(
  "{/:userid}/freezeAccount",
  authentication(),
  validation(validators.freezeAccount),
  userService.freezeAccount,
);

router.get(
  "/:userid",
  validation(validators.shareProfile),
  userService.shareProfile,
);

export default router;
