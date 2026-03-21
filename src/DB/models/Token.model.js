import mongoose from "mongoose";

const tokenschema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    expiresIn: { type: Number, required: true },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Tokenmodel =
  mongoose.models.Token || mongoose.model("Token", tokenschema);
Tokenmodel.syncIndexes();
