const mongoose = require("mongoose");
const User = mongoose.model("User");

ROLES = {
  admin: "a2470ee4",
  adminMaintenance: "a2470ee5",
  userMaintenance: "97f567cf",
  headLaboratory: "a2470ee7",
  technicalLaboratory: "97f567c8",
  supervisorLaboratory: "97f567c9",
  reviewerLaboratory: "97f567c10",
};

const nextChat = (my_string) => {
  return (
    my_string.substring(0, my_string.length - 1) +
    String.fromCharCode(my_string.charCodeAt(my_string.length - 1) + 1)
  );
};

const GetA = (index) => {
  return "A".repeat(index);
};

exports.NextCode = (code) => {
  for (let index = code.length - 1; index >= 0; index--) {
    const element = code[index];
    if (element !== "Z") {
      return (
        code.substring(0, index) +
        nextChat(element) +
        GetA(code.length - 1 - index)
      );
    }
  }
  return GetA(code.length + 1);
};

exports.IsLaboratory = async (userId) => {
  const user = await User.findById(userId);
  return user.isLaboratory;
};
