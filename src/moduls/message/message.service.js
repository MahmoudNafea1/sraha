import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBservice from "../../DB/db.serves.js";
import { Usermodel } from "../../DB/models/users.model.js";
import { uploadFiles } from "../../utils/multer/cloudinary.js";
import { Messagemodel } from "../../DB/models/message.model.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  if (!req.body.content && !req.files) {
    return next(new Error("message content is required"));
  }
  const { receiverId } = req.params;
  if (
    !(await DBservice.findOne({
      model: Usermodel,
      filter: {
        _id: receiverId,
        deletedAt: { $exists: false },
        confirmEmail: { $exists: true },
      },
    }))
  ) {
    return next(new Error("in_valid recipient account ", { cause: 404 }));
  }
  const { content } = req.body;

  let attachments = [];
  if (req.files) {
    attachments = await uploadFiles({
      files: req.files,
      path: `${receiverId}/message`,
    });
  }

  const [message] = await DBservice.create({
    model: Messagemodel,
    data: [{ content, attachments, receiverId, senderId: req.user?._id }],
  });
  return successResponse({ res, status: 201, data: { message } });
});
