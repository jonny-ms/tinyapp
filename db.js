const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  abcdef: {
    id: "abcdef",
    email: "test@test.com",
    password: "password"
  }
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

module.exports = { urlDatabase, users, foundUserFromEmail, generateRandomString }