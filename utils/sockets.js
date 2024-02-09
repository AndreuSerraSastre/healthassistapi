exports.sockets = (io) => {
  io.on("connection", (socket) => {
    socket.on("disconnect", (id) => {
      console.log("disconnect");
    });
  });
};
