import { Router } from "express";
import * as messageService from "./message.service.js";
import * as validators from "./message.validation.js";
import {
  cloudFileUploud,
  fileValidation,
} from "../../utils/multer/cloud.multer.js";
import { validation } from "../../middelware/validation.middelware.js";
import { authentication } from "../../middelware/authentication.middleware.js";

const router = Router({ caseSensitive: true, strict: true });

router.post(
  "/:receiverId",
  cloudFileUploud({ validation: fileValidation.image }).array("attachments", 2),
  validation(validators.sendMessage),
  messageService.sendMessage,
);

router.post(
  "/:receiverId/sender",
  authentication(),
  cloudFileUploud({ validation: fileValidation.image }).array("attachments", 2),
  validation(validators.sendMessage),
  messageService.sendMessage,
);

export default router;
