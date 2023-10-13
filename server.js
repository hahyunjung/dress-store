const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

//요청.body를 위한 코드
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url =
  "mongodb+srv://hyunjung:gkguswjd0305@cluster0.dpfwbqi.mongodb.net/?retryWrites=true&w=majority";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("DressStore");
    app.listen(3080, function () {
      console.log("listening on 3080");
    });
  })
  .catch((err) => {
    console.log(err);
  });

//첫화면 만들기
app.get("/", function (req, res) {
  res.json({ message: "Welcome to DressStore application." });
});

//mongoDB에 있는 모든 컬렉션 출력
app.get("/products", async (요청, 응답) => {
  let result = await db.collection("products").find().toArray();
  console.log(result);
  응답.render("list.ejs", { 글목록: result });
});

//id로 제품 검색하기
app.get("/api/products/:id", async (요청, 응답) => {
  try {
    let result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(요청.params.id) }); //하나의 도큐먼트 찾아옴
    console.log(result);
    응답.render("detail.ejs", { result: result });
  } catch (e) {
    console.log(e);
    응답.status(500).send("이상한 url 입력함");
  }
});

//데이터 만들기
app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});

app.post("/api/products", async (요청, 응답) => {
  console.log(요청.body);

  await db.collection("products").insertOne({
    name: 요청.body.name,
    description: 요청.body.description,
    category: 요청.body.category,
    price: 요청.body.price,
    published: 요청.body.published,
  });
  console.log("post success!");
  응답.redirect("/products");
});

//수정 기능(업데이트)
app.get("/edit/:id", async (요청, 응답) => {
  let result = await db
    .collection("products")
    .findOne({ _id: new ObjectId(요청.params.id) });
  console.log(result);
  응답.render("edit.ejs", { result: result });
});

app.put("/api/products/:id", async (요청, 응답) => {
  await db.collection("products").updateOne(
    { _id: new ObjectId(요청.params.id) },
    {
      $set: {
        name: 요청.body.name,
        description: 요청.body.description,
        category: 요청.body.category,
        price: 요청.body.price,
        published: 요청.body.published,
      },
    }
  );
  console.log("update success!");
  응답.redirect("/products");
});

//name query로 찾기
app.get("/api/products", async (요청, 응답) => {
  let result = await db
    .collection("products")
    .find({ name: 요청.query.name })
    .toArray(); //하나의 도큐먼트 찾아옴
  console.log(result);
  응답.render("list.ejs", { 글목록: result });
});

//published로 검색하기
app.get("/published", async (요청, 응답) => {
  try {
    let result = await db
      .collection("products")
      .find({ published: "true" })
      .toArray(); //하나의 도큐먼트 찾아옴
    console.log(result);
    응답.render("list.ejs", { 글목록: result });
  } catch (e) {
    console.log(e);
    응답.status(500).send("이상한 url 입력함");
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
