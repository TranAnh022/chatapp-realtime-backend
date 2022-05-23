const express = require('express')
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messagesRoutes = require('./routes/messagesRoutes');
const app = express();
const socket =require("socket.io")

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes)
app.use('/api/messages',messagesRoutes)

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
    console.log("DB Connection Successful")
    })
    .catch((err) => {
        console.log(err.message)
    })

const server = app.listen(process.env.PORT, () => {
    console.log('Server start on Port 5000')
})

const io = socket(server, {
    cors: {
      origin: "https://kaleidoscopic-baklava-1d0b4a.netlify.app",
      credentials: true,
    },
  });

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieved", data.message); 
        }
    })
    
})