import mongoose, { Schema } from "mongoose";

export const messageSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 20000,
      required: function () {
        return this.attachments?.length ? false : true;
      },
    },
    attachments: [{ secure_url: String, public_id: String }],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requirer: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Messagemodel =
  mongoose.models.message || mongoose.model("Message", messageSchema);
