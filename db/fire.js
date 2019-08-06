
const admin = require('firebase-admin');
const serviceAccount = require('./key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://compliance-tool-tpg.firebaseio.com"
});

let db = admin.firestore();

// function clearExistingData() {
//   db.collection('cards').remove();
//   db.collection('reviews').remove();
//   db.collection('unavailable').remove();
//   db.collection('updated').remove();

// }


function writeToDb (ref, obj) {
    const doc = (obj.product_id === undefined) ? "undefined" : obj.product_id

    db.collection(ref).doc(Math.random().toString(36).substring(2, 15)).set({obj})
  .then(() => {
  })
  .catch((err) => {
    console.log(error)
  })
}

let disconnect = () => {
  db.goOffline()

}

module.exports = {
  writeToDb, 
  disconnect,
}
