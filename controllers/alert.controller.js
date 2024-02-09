const mongoose = require("mongoose");
const Alert = mongoose.model("Alert");
const { io } = require("./../server");
const { catchAsync } = require("../utils/catchAsync");

exports.getAllAlert = catchAsync(async (req, res) => {
  const alerts = await Alert.find({ to: { $in: [req.decoded.usr] } });
  res.status(200).json(alerts);
});

exports.createAlert = catchAsync(async (req, res) => {
  const newAlert = await Alert.create({
    ...req.body,
    from: req.decoded.usr,
  });
  io.emit("refreshAlerts");
  res.status(201).json(newAlert);
});

exports.updateAlert = catchAsync(async (req, res) => {
  const { id } = req.params;
  const alert = await Alert.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  io.emit("refreshAlerts");
  res.status(200).json(alert);
});

exports.deleteAlert = catchAsync(async (req, res) => {
  const ids = req.body;
  const query = await Alert.deleteMany({
    _id: { $in: ids },
  });

  io.emit("refreshAlerts");

  if (query.deletedCount > 0) {
    res.status(204).json(1);
    return;
  }

  res.status(500).json("Not found");
});

exports.createInternalAlert = async (body) => {
  await Alert.create(body);
  io.emit("refreshAlerts");
};
