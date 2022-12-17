const express=require("express");
const bodyParser=require("body-parser");
const app=express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");
const date=require(__dirname+"/date.js");
const _=require("lodash");
const mongoose=require("mongoose");
mongoose.set('strictQuery', false);
// mongodb://localhost:27017/todoDB
mongoose.connect("mongodb+srv://prashantkumar010704:prashant123@cluster0.hesmolu.mongodb.net/?retryWrites=true&w=majority");
const listSchema = mongoose.Schema({
    items:String
})
const ListaSchema = mongoose.Schema({
    name:String,
    items:[listSchema]
})

const Item=mongoose.model("Item",listSchema);
const Lista=mongoose.model("Lista",ListaSchema);
let navDB;

const one=new Item({
    items:"Welcome to todoList"
})
const two=new Item({
    items:"<--- Click to delete"
})
const three=new Item({
    items:"to add click + button"
})

const data=[one,two,three];

//global variables ==>
let pageTitle="";
// const newitems = [];
// const workItems = [];

app.get("/",function(req,res){
    pageTitle="To-Do List";
    const day=date.getDate(); 
    // res.send("working....");
    // console.log(day);
    Item.find({},function(err,contentArray)
    {
        if(contentArray.length===0){
            Item.insertMany(data,function(err){
                if(err) console.log(err);
                else console.log("success inserted!");
            })
            res.redirect("/");
        }
        else
        {
            res.render("list",{kindOfday:day, newi:contentArray,headIng:pageTitle});
        }
    })
})
app.get("/custom",function(req,res){
    Lista.deleteOne({name: "Favicon.ico"},function(err){
        if(!err)
        {
            Lista.find({},function(err,foundItam){
                if(!err)
                {
                    navDB=foundItam
                    // console.log(navDB);
                    res.render("custom",{customItems: navDB});
                }
            })
        }
    })
})
app.get("/:any",function(req,res){
    // console.log(req.body);
    const day=date.getDate();
    const paramA=(req.params.any);
    const paramB=_.capitalize(paramA);
    // console.log(paramA);
    let lista=new Lista({
        name:paramB,
        items:data
    });
    Lista.findOne({name: paramB},function(err,foundItem){
        // console.log(foundItem);
        if(!err){
            if(!foundItem)
            {
                // console.log("De!")
                Lista.insertMany(lista,function(err){
                    if(err) console.log(err);
                    else ("s!!");
                })
                res.redirect("/"+paramB+"");
            } 
            else 
            {
                // console.log("e!")
                res.render("list",{kindOfday:day, newi:foundItem.items,headIng:foundItem.name});
            }
        }
    })
    
})

app.post("/",function(req,res){
    const newitem = req.body.newItem;
    
    const type= req.body.button;
    let nayaItem=new Item({
        items:newitem
    })
    if(type==="To-Do List")
    {
        // newitems.push(newitem);
        Item.insertMany(nayaItem,function(err){
            if(err) console.log(err);
            else console.log("success inserted!");
        })
        res.redirect("/");
    }
    else
    {
        Lista.find({name: type}, function(err,foundItem){
            if(!err)
            {
                // console.log(foundItem[0].items);
                foundItem[0].items.push(nayaItem);
                foundItem[0].save();
                res.redirect("/"+type+"");
            }
        })
    }
    // console.log(req.body.button);
})



app.post("/delete",function(req,res){
    
    // console.log(req.body);
    let hidName=(req.body.button);
    const idd = req.body.checkBox;
    // console.log(hidName);
    if(hidName==="To-Do List")
    {
        Item.findOneAndDelete({_id: idd},function(err){
            if(err) console.log(err);
            else console.log("deleted !");
        })
        res.redirect("/");
    }
    else if(hidName==="custom")
    {
        Lista.findOneAndDelete({_id: idd},function(err){
            if(err) console.log(err);
            else console.log("deleted !");
            res.redirect("/custom");
        })
    }
    else 
    {
        Lista.updateOne({name: hidName},{$pull: {items: {_id: idd}}},function(err){
            if(!err)
            {
                console.log("updated!");
                res.redirect("/"+hidName+"");
            }
        })
    }
})
app.post("/:any",function(req,res){
    const newPost=(req.body.newList);
    res.redirect("/"+newPost+"");
})
const port=process.env.PORT || 3000;
app.listen(port,function(){
    console.log("server started on port 3000....");
})