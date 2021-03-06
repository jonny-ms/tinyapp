const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override")
const { urlDatabase, users, getUserByEmail, generateRandomString, urlsForUser } = require("./db");
const PORT = 8080;

const app = express();
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "user_id",
  keys: ["asdfgh", "qwerty"]
}));

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login", {user: users[req.session.user_id]});
});

app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send("Error: Email not found.");
  } else {
    let user = getUserByEmail(req.body.email, users);
    if (!bcrypt.compareSync(req.body.password, users[user].password)) {
      res.status(403).send("Error: Password incorrect. If you forgot, sorry I can't help you..");
    } else {
      req.session.user_id = users[user].id;
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register", {user: users[req.session.user_id]});
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Error: Email and password fields are required for registration.");
  } else if (getUserByEmail(req.body.email, users)) res.status(400).send("Error: Email already assigned to user");
  let id = generateRandomString();
  users[id] = { id, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  
  let user = req.session.user_id;
  let templateVars = { urls: urlsForUser(user), user: users[user]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", {user: users[req.session.user_id]});
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let user = req.session.user_id;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL , user: users[user], urls: urlsForUser(user)};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.delete("/urls/:shortURL", (req, res) => {
  const has = Object.prototype.hasOwnProperty;
  const userUrls = urlsForUser(req.session.user_id);
  if (has.call(userUrls, req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.put("/urls/:shortURL", (req, res) => {
  const has = Object.prototype.hasOwnProperty;
  const userUrls = urlsForUser(req.session.user_id);
  if (has.call(userUrls, req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  }
  res.redirect("/urls");
});