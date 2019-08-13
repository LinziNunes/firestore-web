import 'firebase/firestore';
import * as FirebaseFirestore from '@google-cloud/firestore'

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
export let db = fire.firestore();

var messages = [] 
var listeners = []    // list of listeners
var start = null      // start position of listener
var end = null        // end position of listener

export async function getMessages(refDoc) {
  // query reference for the messages we want
  let ref = db.collection(refDoc).limit(20)
  // single query to get startAt snapshot
  let rows = []
  await ref.get()
  .then((snapshots) => {
  // save startAt snapshot
  start = snapshots.docs[snapshots.docs.length - 1]
  // create listener using startAt snapshot (starting boundary)    
  let listener = ref
    .startAt(start)
    .onSnapshot((messages) => {
      // append new messages to message array
      messages.forEach((doc) => {
        // filter out any duplicates (from modify/delete events)         
        let row = doc.data().obj;
        row.key = doc.id
        rows.push(row) 
      })
    // add listener to list
    listeners.push(listener)

  })
  }).then(res => {
    console.log(rows)
    return rows
  } )
}
export async function getMoreMessages(refDoc) {
  let ref = db.collection(refDoc)
  // single query to get new startAt snapshot
  await ref.orderBy('value', 'desc')
  .startAt(start)
  .limit(50).get()
  .then((snapshots) => {
   // previous starting boundary becomes new ending boundary
    end = start
    start = snapshots.docs[snapshots.docs.length - 1]
    // create another listener using new boundaries     
    let listener =  ref.orderBy('value')
    .startAt(start).endBefore(end)
    .onSnapshot((messages) => {
      messages.forEach((message) => {
        messages = messages.filter(x => x.id !== message.id)
        messages.push(message.data())
      })
    })
    listeners.push(listener)
  })
}
// call to detach all listeners
export function detachListeners() {
  listeners.forEach(listener => listener())
}

