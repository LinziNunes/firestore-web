const firebase = require("firebase");
// get database, auth and storage
require("firebase/auth");
require("firebase/storage");
require("firebase/database");

// const config = {
//   apiKey: "AIzaSyDfdlpoFtXjFumr_ZEWFplRW2iDF3LfGSk",
//   authDomain: "compliance-tool-tpg.firebaseapp.com",
//   databaseURL: "https://compliance-tool-tpg.firebaseio.com",
//   projectId: "compliance-tool-tpg",
//   storageBucket: "compliance-tool-tpg.appspot.com",
//   messagingSenderId: "133252469325",
//   appId: "1:133252469325:web:0d37c19992e4a246"
// };

// firebase.initializeApp(config);

// Get a reference to the database service
var fire = firebase.database();

function clearExistingData() {
  fire.ref('cards').remove();
  fire.ref('reviews').remove();
  fire.ref('unavailable').remove();
}


function writeToDb (ref, obj) {
  fire.ref(ref).push(obj)
  .then(() => {
  })
  .catch((err) => {
    console.log(err)
  })
}

let disconnect = () => {
  fire.goOffline()

}
let deleteDB = () => {

}


module.exports = {
  writeToDb, 
  disconnect,
  clearExistingData
}
