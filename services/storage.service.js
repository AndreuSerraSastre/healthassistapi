const fetch = require("node-fetch");
const FormData = require("form-data");

const BASE_FOLDER = "files";

const PROD_URL = "https://storage-core.app.elingenierojefe.es";

exports.BASE_URL =
  process.env.NODE_ENV === "development"
    ? PROD_URL
    : "http://srv-captain--storage-core:1337";

exports.storeFile = async (base64, fileName) => {
  try {
    const data = new FormData();
    data.append(
      BASE_FOLDER,
      Buffer.from(base64.split("base64,")[1], "base64"),
      fileName
    );

    const response = await fetch(`${this.BASE_URL}/upload`, {
      method: "POST",
      body: data,
    })
      .then((response) => response.json())
      .catch((err) => {
        if (err) {
          throw err;
        }
      });

    return {
      _id: response[0]._id,
      name: response[0].name,
      hash: response[0].hash,
      size: response[0].size,
      url: `${PROD_URL}${response[0].url}`,
    };
  } catch (err) {
    return "";
  }
};

exports.deleteFile = async (id) => {
  const response = await fetch(`${this.BASE_URL}/upload/files/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .catch((err) => {
      if (err) {
        console.log("[KORE STORAGE ERROR]: ", err.message);
        throw err;
      }
    });

  return response;
};
