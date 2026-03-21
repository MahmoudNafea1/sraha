import joi from "joi";
import { generalFialds } from "../../middelware/validation.middelware.js";
import { fileValidation } from "../../utils/multer/cloud.multer.js";

export const sendMessage = {
  params: joi
    .object()
    .keys({
      receiverId: generalFialds.id.required(),
    })
    .required(),

  body: joi
    .object()
    .keys({
      content: joi.string().min(2).max(20000),
    })
    .required(),

  files: joi
    .array()
    .items(
      joi.object().keys({
        fieldname: generalFialds.file.fieldname.valid("attachments").required(),
        originalname: generalFialds.file.originalname.required(),
        encoding: generalFialds.file.encoding.required(),
        mimetype: generalFialds.file.mimetype
          .valid(...fileValidation.image)
          .required(),
        destination: generalFialds.file.destination.required(),
        filename: generalFialds.file.filename.required(),
        path: generalFialds.file.path.required(),
        size: generalFialds.file.size.required(),
      }),
    )
    .min(0)
    .max(2),
};
