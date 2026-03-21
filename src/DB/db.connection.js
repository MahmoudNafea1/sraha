import mongoose from "mongoose";

export const connectdb = async () => {
  try {
    const uri = process.env.DB_URI;
    const result = await mongoose.connect(uri);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("fail to connect DB", error);
  }
};
