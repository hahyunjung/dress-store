const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url =
  "mongodb+srv://hyunjung:gkguswjd0305@cluster0.dpfwbqi.mongodb.net/?retryWrites=true&w=majority";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB connected");
    db = client.db("DressStore");
    app.listen(3080, function () {
      console.log("listening on 3080");
    });
  })
  .catch((err) => {
    console.log(err);
  });

//making index page
app.get("/", function (req, res) {
  res.json({ message: "Welcome to DressStore application." });
});

//print all collections in mongoDB
app.get("/products", async (req, res) => {
  let result = await db.collection("products").find().toArray();
  console.log(result);
  res.render("list.ejs", { datalist: result });
});

//search by id
app.get("/api/products/:id", async (req, res) => {
  try {
    let result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });
    console.log(result);
    res.render("detail.ejs", { result: result });
  } catch (e) {
    console.log(e);
    res.status(500).send("wrong URL");
  }
});

//write data, add data
app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.post("/api/products", async (req, res) => {
  console.log(req.body);

  await db.collection("products").insertOne({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    published: req.body.published,
  });
  console.log("post success!");
  res.redirect("/products");
});

//update
app.get("/edit/:id", async (req, res) => {
  let result = await db
    .collection("products")
    .findOne({ _id: new ObjectId(req.params.id) });
  console.log(result);
  res.render("edit.ejs", { result: result });
});

app.put("/api/products/:id", async (req, res) => {
  await db.collection("products").updateOne(
    { _id: new ObjectId(req.params.id) },
    {
      $set: {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        published: req.body.published,
      },
    }
  );
  console.log("update success!");
  res.redirect("/products");
});

//finding by name
app.get("/api/products", async (req, res) => {
  let result = await db
    .collection("products")
    .find({ name: req.query.name })
    .toArray();
  console.log(result);
  res.render("list.ejs", { datalist: result });
});

//search if it is published
app.get("/published", async (req, res) => {
  try {
    let result = await db
      .collection("products")
      .find({ published: "true" })
      .toArray();
    console.log(result);
    res.render("list.ejs", { datalist: result });
  } catch (e) {
    console.log(e);
    res.status(500).send("wrong url");
  }
});

app.delete("/delete/:id", async (req, res) => {
  const result = await db.collection("products").deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.redirect("/products");
  console.log(result);
  console.log("delete success");
});

app.delete("/api/delete", async (req, res) => {
  const result = await db.collection("products").deleteMany({});
  res.redirect("/products");
  console.log(result);
  console.log("delete ALL success");
});
