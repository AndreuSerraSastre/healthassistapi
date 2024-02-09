/**
 * Encapsulates the main function from an api controller inside a try/catch block
 * @param {*} func
 * @returns
 */
module.exports.catchAsync = (func) => {
  return (req, res) => {
    func(req, res).catch((err) => {
      res.status(400).json({
        status: "fail",
        message: handleMessageResponse(err),
      });
    });
  };
};

const handleMessageResponse = (err) => {
  console.log(err);
  const DUPLICATE = "duplicate";
  if (err?.message?.includes(DUPLICATE)) {
    if (err.keyValue.instrumentNo) {
      return "Este número de instrumento ya existe.";
    } else if (err.keyValue.tag) {
      return "Este TAG ya existe.";
    } else if (JSON.stringify(err.keyValue).includes("document.number")) {
      return "Este número de DNI ya existe.";
    } else if (err.keyValue.username) {
      return "Este nombre de usuario ya existe.";
    } else if (err.keyValue.email) {
      return "Este email ya existe.";
    } else {
      return "Hay una clave duplicada: " + JSON.stringify(err.keyValue) + ".";
    }
  }
  return err._message;
};
