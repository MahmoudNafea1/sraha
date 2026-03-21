import multer from "multer";

export const fileValidation = {
  image: ["image/jpeg", "image/jpg", "image/png"],
  document: ["application/pdf", "application/msword"],
};
export const cloudFileUploud = ({ validation = [] } = {}) => {
  const storage = multer.diskStorage({});

  const fileFilter = function (req, file, callback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback("In-valid file format", false);
  };

  return multer({ data: "./temp", fileFilter, storage });
};
