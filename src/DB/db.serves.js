export const findOne = async ({ model, filter = {}, select = "" } = {}) => {
  return await model.findOne(filter).select(select);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
}) => {
  return await model.create(data, options);
};

export const findById = async ({
  model,
  _id,
  select = "",
  populate = [],
} = {}) => {
  return await model.findById(_id).select(select).populate(populate);
};

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  option = { runValidtors: true },
  select = "-password",
} = {}) => {
  return await model.updateOne(filter, data, option).select(select);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  select = "",
  populate = [],
  option = { runValidtors: true, new: true },
} = {}) => {
  return await model
    .findOneAndUpdate(
      filter,
      {
        ...data,
        $inc: { __v: 1 },
      },
      option,
    )
    .select(select)
    .populate(populate);
};

export const deleteOne = async ({
  model,
  filter = {},
  select = "-password",
} = {}) => {
  return await model.deleteOne(filter).select(select);
};
