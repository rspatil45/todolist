const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const lodash = require('lodash');
const mongoose = require('mongoose');
const date = require('./date.js');

mongoose.connect("mongodb+srv://admin:rspatil45@mongoserver-caqwf.mongodb.net/todoList", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

const itemsSchema = {
  name: String
}
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Eating"
});

const item2 = new Item({
  name: "Sleeping"
});

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("list", listSchema);

const defaultItem = [item1, item2];
const today = "Today";

// var newListItems = ["Cooking food","Eating food","update status"];
// var workList = [];
app.get("/", (req, res) => {
  Item.find({}, (err, foundItem) => {
    // if (foundItem.length == 0) {
    //   Item.insertMany(defaultItem, function(err) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log("Data inserted successfully");
    //     }
    //   });
    //   res.render("list", {
    //     kindOfDay: today,
    //     newListItems: foundItem
    //   });
    // } else {
    //
    res.render("list", {
      kindOfDay: today,
      newListItems: foundItem
    });
    //   }
  });

});

app.get("/:topic", (req, res) => {

  const customList = lodash.capitalize(req.params.topic);
  List.findOne({
    name: customList
  }, function(err, result) {
    if (result) {
      res.render("list", {
        kindOfDay: result.name,
        newListItems: result.items
      });

    } else {
      const list = new List({
        name: customList,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customList);
    }
  });

});


app.post("/", (req, res) => {
  // console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.button;
  const item = new Item({
    name: itemName
  });
  if (req.body.button === today) {
    if (itemName != "") {
      item.save();
    }
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (foundList) {
        if (itemName != "") {
          foundList.items.push(item);
          foundList.save(); //saving must after updating
          //inserting newly creasted item
        }
        res.redirect("/" + listName);
        //  console.log(listName);
      }
    });

  }
});

app.post("/delete", (req, res) => {
  const ditem = req.body.checkbox;
  const currentList = req.body.listName;
  if (currentList === today) {
    Item.deleteOne({
      _id: ditem
    }, function(err) {
      if (!err) {
        console.log("successfully deleted item");
      } else {
        console.log(err);
      }
    });
    res.redirect("/"); //redirect to home page after deleting the element
  } else {
    List.findOneAndUpdate({
      name: currentList
    }, {
      $pull: {
        items: {
          _id: ditem
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + currentList);
      }
    });
  }
});




app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port 3000");
});
