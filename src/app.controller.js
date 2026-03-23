import * as dotenv from "dotenv";
// dotenv.config({});
dotenv.config({ path: path.join("./src/config/.env.dev") });
import path from "node:path";
import express from "express";
import authController from "./moduls/auth/auth.controller.js";
import messageController from "./moduls/message/message.controller.js";
import userController from "./moduls/user/user.controller.js";
import { connectdb } from "./DB/db.connection.js";
import { globalErrorHandling } from "./utils/response.js";
import cors from "cors";
import { sendEmail } from "./utils/email/send.email.js";
import morgan from "morgan";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const bootstrap = async () => {
  const port = process.env.PORT;
  const app = express();
  //cors
  app.use(cors());
  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 2000,
    message: { error: "too many requsts " },
  });
  app.use("/auth", limiter);

  app.use(morgan("dev"));
  // DB connect
  await connectdb();
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  // convert Buffer data
  app.use(express.json());
  // app-routing
  app.get("/", (req, res, next) => {
    res.send({ message: "hello world" });
  });
  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/message", messageController);
  app.use(globalErrorHandling);

  app.listen(port, () => {
    console.log("server is running");
  });
};
export default bootstrap;
