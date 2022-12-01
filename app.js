const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const dotenv = require("dotenv").config();
// const date = require(__dirname + "/date.js");

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static ("static"))

// mongodb connect
mongoose.connect("mongodb+srv://" + user + ":" + password + "@cluster0.bz5eaxt.mongodb.net/"+ dbName, {useNewUrlParser: true});

// creating schema
const itemsSchema = new mongoose.Schema({
    name: String
});

// creating mongoose model
const Item = mongoose.model("Item" , itemsSchema);

//creating documents for the DB
const item1 = new Item({
    name : "Welcome to your to-dolist"
});
const item2 = new Item({
    name : "Hit the + button to add new item"
});
const item3 = new Item({
    name : "<--- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

// schema for customLists
const listSchema = new mongoose.Schema({
    name : String,
    items : [itemsSchema]
});

// Model for customLists
const List = mongoose.model("List" , listSchema);



app.get("/", function(req , res){

    // const day = date.getDate();
    // const day = date.getDay();

    Item.find(function(err , foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems , function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully added defaultItems to the DB");
                }
            })
            res.redirect("/");
        }else{
            res.render("list" , {listTitle : "Today", newListItems : foundItems});
        }
    });
});


app.get("/:newList" ,function(req,res){

    const listTitle = _.capitalize(req.params.newList);

List.findOne({name:listTitle}, function(err, foundList){
    if(!err){
        if(!foundList){
            const list = new List({
                name : listTitle,
                items : defaultItems
            });
        
            list.save();
            res.redirect("/"+ listTitle);
        }else{
            res.render("list" , {listTitle : foundList.name , newListItems : foundList.items});
        } 
    }
});   
});


app.post("/" , function(req,res){
    const newItem = req.body.addItem;
    const listName = req.body.list;

    const item = new Item({
        name: newItem
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");  
    }else{
        List.findOne({name : listName} , function(err , foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
 
});

app.post("/delete" ,function(req, res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){

        Item.findByIdAndRemove(checkedItem, function (err){
            if(!err){
                console.log("Successfully removed the item");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull :{items :{_id : checkedItem}}} , function(err , foundList){
            if(!err){
                res.redirect("/"+ listName);
            }
        });
    }

   
});

app.listen(process.env.PORT || 3000, function(){
    console.log("server is running on port 3000...");
});





