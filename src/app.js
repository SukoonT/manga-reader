const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const PORT = 5700;
app.use(express.json())
app.use("/public",express.static(path.join(__dirname,"/public/")));


app.get("/", (req, res) => {
    res.sendFile("./index.html", { root: __dirname });
});
app.get('/mangaList',(req, res) => {
    fs.readdir((path.join(__dirname,"manga/")),'utf8',(err,data) => {
        if(err){
            res.status(400).send({err: err});
            // return;
        }
        res.send(data)
    })
})
app.listen(PORT, () => console.log(`listening to port ${PORT}`));
fs.readdir("/",'utf-8',(err,data)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log(data);
})