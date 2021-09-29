const port = process.env.PORT;

const io = require("socket.io")(port, {
  cors: {
    origin: "*",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  console.log(userId, socketId);
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("a user connected");
  //take userid and socketid fromuser
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get messsge
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    console.log(user, "single user");
    console.log(users, "sendMessage");
    io.to(user.senderId).emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("sendMessageToGroup", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessageinGroup", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log("someone disconnect");
    removeUser(socket.id);
    io.emit("getUser", users);
  });
});

console.log("welcom");
