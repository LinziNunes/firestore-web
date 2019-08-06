// import firebase from "firebase";

// // Required for side-effects
// require("@firebase/functions");

// // The Firebase Admin SDK to access the Firebase Realtime Database.
// const admin = require('firebase-admin');
// const fire = firebase.initializeApp({
//   apiKey: "AIzaSyDfdlpoFtXjFumr_ZEWFplRW2iDF3LfGSk",
//   authDomain: "compliance-tool-tpg.firebaseapp.com",
//   databaseURL: "https://compliance-tool-tpg.firebaseio.com",
//   projectId: "compliance-tool-tpg",
//   storageBucket: "compliance-tool-tpg.appspot.com",
//   messagingSenderId: "133252469325",
//   appId: "1:133252469325:web:0d37c19992e4a246"
// });


// function clearExistingData() {
//   fire.ref('cards').remove();
//   fire.ref('reviews').remove();
//   fire.ref('unavailable').remove();
  
// }


// function writeToDb (ref, obj) {
//   fire.ref(ref).push(obj)
//   .then(() => {
//   })
//   .catch((err) => {
//     console.log(err)
//   })
// }

// export default fire;

import 'firebase/firestore';

const admin = require('firebase-admin');
const serviceAccount = require('./key.json')

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

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://compliance-tool-tpg.firebaseio.com"
// });

let db = fire.firestore();

export default db