import { roleenum } from "../../DB/models/users.model.js";

export const endpoint = {
  profile: [roleenum.admin, roleenum.user],
  restoreAccount: [roleenum.admin],
  deleteAccount: [roleenum.admin],
};
