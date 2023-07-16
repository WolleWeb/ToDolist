//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

   mongoose.connect("mongodb+srv://veroxlive1:Pokemoner132@cluster0.un9cv7e.mongodb.net/todolistDB");

  const itemSchema = new mongoose.Schema(
    {
      name: String
    }
  );

  const Item = mongoose.model("Item", itemSchema);

  const item1 = new Item(
    {
      name: "Buy Food"
    }
  );

  const item2 = new Item(
    {
      name: "Cook Food"
    }
  );

  const item3 = new Item(
    {
      name: "Eat Food"
    }
  );


  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemSchema]
  };

  const List = mongoose.model("List", listSchema);

  if(defaultItems.lenght === 0){
   Item.insertMany(defaultItems)
     .then(function(){
       console.log("Successfully saved to yur DB");
      })
     .catch(function(err){
       console.log(err);
     });}else {
      console.log("Default Items inserted already");
     }

 


  


app.get("/", function(req, res) {

  Item.find({})
  .then(foundItem => {
    if(foundItem.length === 0){
      return Item.insertMany(defaultItems);
    }else {
      return foundItem;
    }
  })
  .then(savedItem => {
    res.render("list", {
      listTitle: "Today",
      newListItems: savedItem
    });
  })
  .catch(err => console.log(err));

  // res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/:customListName", function(req,res){

  let newList = req.params.customListName;

  List.findOne({name: newList})
  .then(listItem => {
    if(!listItem){
      //Create a New List
      const list = new List({
        name: newList,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + newList);
    }else{
      res.render("list", {listTitle: listItem.name, newListItems: listItem.items});
    }
  })
  .catch(err => {
    console.log(err);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  let dynamicItem = new Item(
    {
      name: itemName
    }
  );

  if(listName === "Today"){
    dynamicItem.save();
    res.redirect("/");
  }else {
    List.findOne({name: listName})
    .then(foundList =>{
      foundList.items.push();
      foundList.save();
      res.redirect("/"+ listName)
    }).catch(err=>{console.log(err)});
  }

  

  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(removedItem =>{
      console.log("Item with the Id of "+ checkedItemId +"removed Successfully");
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
  }else{
    Item.findOneAndRemove(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}}
    ).then(remov => {
      console.log("Item with the Id of "+ checkedItemId +"removed Successfully");
      res.redirect("/" + listName )
    }).catch(err => {console.log(err)});
  }

 
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
