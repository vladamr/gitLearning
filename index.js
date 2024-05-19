import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";

const app = express();
const port = 3000;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { error } from "console";
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books_world",
  password: "12v34l56a",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const authorUserId = 1;
var currentUserId = 1;
// var currentUserId = req.body.user;
let users = [];

async function checkName() {
 
  const result = await db.query("SELECT name FROM users WHERE id = $1; ", [
    currentUserId,
  ]);
  const name = result.rows;
    // return JSON.stringify(name);
   
    for (var key in name) {
      console.log(key + ': ' + name[key]);
      }

  //  console.log(name);
  return (name);
}

async function checkDescription() {

  const result = await db.query(
    "SELECT description FROM users WHERE id = $1; ",
    [currentUserId]
  );
  const description = result.rows;
  // return JSON.stringify(description);
  // console.log(description);

  for (var key in description) {
    console.log(key + ': ' + description[key]);
    }

  return (description);
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}

async function checkRead() {
  
  const result = await db.query(
    "SELECT book FROM read_books JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId]
  );
  let books = [];
  result.rows.forEach((book) => {
    books.push(book.book);
  });
  return books;
}

app.get("/", async (req, res) => {
  const name = await checkName();
  const description = await  checkDescription();
  const currentUser = await getCurrentUser();
  const readBooks = await checkRead();
  res.render("index.ejs", {
    name: name,
    description: description,
    users: users,
    readBooks: readBooks,
  });
});

app.post("/user", async (req, res) => {
  if (req.body.add === "Check In Now!") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const password = req.body.password;

  const result = await db.query(
    "INSERT INTO users (name, description, password) VALUES($1, $2, $3) RETURNING *;",
    [name, description, password]
  );

  const id = result.rows[0].id;
  currentUserId = id;

  res.redirect("/userHomePage");
});

app.post("/rigistredUser", async (req, res) => {
  let users = [];
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

// app.post("/entry", async (req, res) => {
// if (req.body.entry === "Log In Here") {
//     res.render("entry.ejs");
//   } else if (req.body.name == user.name)
//   {

//     res.redirect("/");
//   }
//   currentUserId = req.body.user;
//   const name = await db.query("SELECT name FROM users WHERE id = $1;", [
//     currentUserId,
//   ]);

//   const password = await db.query("SELECT password FROM users WHERE id = $1;", [
//     currentUserId,
//   ]);

//   if (req.body.name == name && req.body.password == password) {
//     res.redirect("/userHomePage");
//   } else {
//     console.log("something went wrong");
//   }
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
