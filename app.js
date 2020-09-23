const express = require("express");
const app = express();
const {v4:uuidV4} = require("uuid"); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const ejs = require("ejs");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const {ExpressPeerServer}= require("peer");
const peerServer = ExpressPeerServer(server,{
    debug:true
});
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use("/peerjs",peerServer);
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
  })
  app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  })
io.on("connection",socket=>{
    socket.on("join-room",(roomId,userId)=>{
        console.log("joined-room");
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected",userId);
        socket.on('message',message=>{
            io.to(roomId).emit("createMessage",message);
        })
        socket.on('disconnect',()=>{
            socket.to(roomId).broadcast.emit("user-disconnected",userId);
        })
    })
})
server.listen(process.env.PORT || 5000,function(){
    console.log("Server is started on port 5000");
});