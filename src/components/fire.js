//import 'firebase/firestore';

const firebase = require("firebase");
// get database, auth and storage
require("firebase/auth");
require("firebase/storage");
require("firebase/database");

const config = {
  apiKey: "AIzaSyDfdlpoFtXjFumr_ZEWFplRW2iDF3LfGSk",
  authDomain: "compliance-tool-tpg.firebaseapp.com",
  databaseURL: "https://compliance-tool-tpg.firebaseio.com",
  projectId: "compliance-tool-tpg",
  storageBucket: "compliance-tool-tpg.appspot.com",
  messagingSenderId: "133252469325",
  appId: "1:133252469325:web:0d37c19992e4a246"
};

let fire = firebase.initializeApp(config);
export let db = fire.firestore();



// const admin = require('firebase-admin');
// const serviceAccount = require('./key.json')

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://compliance-tool-tpg.firebaseio.com"
// });

// let db = admin.firestore();



// function writeToDb (ref, obj) {
//     const doc = (obj.product_id === undefined) ? "undefined" : obj.product_id

//     db.collection(ref).doc(Math.random().toString(36).substring(2, 15)).set({obj})
//   .then(() => {
//   })
//   .catch((err) => {
//     console.log(err)
//   })
// }

// let disconnect = () => {
//   db.goOffline()

// }

// module.exports = {
//   writeToDb, 
//   disconnect
// }