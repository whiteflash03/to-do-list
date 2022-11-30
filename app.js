const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");

const app = express();

const items = ["Buy something"];
const workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static ("static"))

app.get("/", function(req , res){

    const day = date.getDate();
    // const day = date.getDay();

    res.render("list" , {listTitle : day , newListItems : items});
});


app.post("/" , function(req,res){
    let newItem = req.body.addItem;

        if(req.body.button == "Work"){
        
             workItems.push(newItem)
             res.redirect("/work");

        }else{
            
            items.push(newItem);
            res.redirect("/");
        }
});


app.get("/work" ,function(req,res){
res.render("list" , {listTitle : "Work List" ,  newListItems : workItems});
});


app.listen(3000, function(){
    console.log("server is running on port 3000...");
});