const bcrypt = require("bcrypt");

const users = {
  abcdef: {
    id: "abcdef",
    email: "test@test.com",
    password: bcrypt.hashSync("password", 10)
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: users.abcdef.id },
  "9sm5xK": { longURL: "http://www.google.com", userID: users.abcdef.id}
};

const foundUserFromEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) return user;
  }
  return false;
};

const generateRandomString = function() {
  let result = '';
  let characters = 'abcbefghijklmnopqurstuvwxyz0123456789';
  for (let i = 1; i <= 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  } 
  return result;
};

const urlsForUser = function(id) {
  let userURLs = {}
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url].longURL;
    }
  }
  return userURLs;
};

module.exports = { urlDatabase, users, foundUserFromEmail, generateRandomString, urlsForUser }