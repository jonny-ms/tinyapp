const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { urlDatabase, users, foundUserFromEmail, generateRandomString } = require("./db");
const PORT = 8080;

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login", {user: users[req.cookies.user_id]});
});

app.post("/login", (req, res) => {

  if (!foundUserFromEmail(req.body.email)) {
    res.status(403).send("Error: Email not found.")
  } else {
    let user = foundUserFromEmail(req.body.email)
    if (users[user].password !== req.body.password) {
      res.status(403).send("Error: Password incorrect. If you forgot, sorry I can't help you..")
    } else {
      res.cookie("user_id", users[user].id);
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register", {user: users[req.cookies.user_id]})
});

app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password) {
    res.status(400).send("Error: Email and password fields are required for registration.");
  } else if (foundUserFromEmail(req.body.email)) res.status(400).send("Error: Email already assigned to user")
  let id = generateRandomString();
  users[id] = { id, email: req.body.email, password: req.body.password};
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let user = req.cookies.user_id
  let templateVars = { urls: urlDatabase, user: users[user]}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {user: users[req.cookies.user_id]});
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id]}
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect("/urls")
});