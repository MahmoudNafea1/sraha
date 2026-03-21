import mongoose from "mongoose";

export const genderenum = { male: "male", female: "female" };
export const roleenum = { user: "user", admin: "admin" };
export const providerEnum = { system: "system", google: "google" };

const userschema = new mongoose.Schema(
  {
    firstname: {
      required: true,
      type: String,
      minlength: 2,
      maxlength: [
        20,
        "first name max length is 20 and you have entered {VALUE}",
      ],
    },
    lastname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: [
        20,
        "last name max length is 20 and you have entered {VALUE}",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hashOtp: String,
    password: {
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
      type: String,
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genderenum),
        message: `gender only allow ${Object.values(genderenum)}`,
      },
      default: genderenum.male,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(roleenum),
      },
      default: roleenum.user,
    },
    forgotPasswordOTP: String,
    changecredentialsTime: Date,
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    cover: [{ secure_url: String, public_id: String }],
    confirmEmail: Date,
    picture: { secure_url: String, public_id: String },

    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    deletedAt: Date,
    deletedBy: { type: mongoose.Types.ObjectId, ref: "user" },
    restoredAt: Date,
    restoredBy: { type: mongoose.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
userschema
  .virtual("fullname")
  .set(function (nameValues) {
    const [firstname, lastname] = nameValues?.split(" ") || [];
    this.set({ firstname, lastname });
  })
  .get(function () {
    return this.firstname + " " + this.lastname;
  });

userschema.virtual("messages", {
  localField: "_id",
  foreignField: "receiverId",
  ref: "Message",
});

export const Usermodel =
  mongoose.models.User || mongoose.model("User", userschema);
Usermodel.syncIndexes();
