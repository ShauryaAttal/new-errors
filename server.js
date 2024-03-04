const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const {ExpressPeerServer} = require("peer")

const server = require("http").Server(app);
const peerServer = ExpressPeerServer(server,{
    debug:true
})
app.use("/peerjs", peerServer)
const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server,{
    cors:{
        origin:"*"
    }
})

// respond with "hello world" when a GET request is made to the homepage
app.get("/", (req, res) => {
  //   res.render("index")
  res.redirect(`/${uuidv4()}`);
});
app.get("/:room", (req, res) => {
  res.render("index", { roomId: req.params.room });
});

io.on('connection', (socket) => {
    socket.on("join-room", (roomId, userId, userName)=>{
        console.log(roomId+ " : "+userId+" : "+ userName)
        socket.join(roomId)
        io.to(roomId).emit("user-connected", userId)
        socket.on("student", (message)=>{
            //io.emit("createMessage", message)
            io.to(roomId).emit("createMessage", message, userName)
            console.log("what msg: ", message)
        })
    })
    
  });

server.listen(3000);
