
const admin = require('firebase-admin');
const serviceAccount = require('./key.json')
const Promise = require('bluebird')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://compliance-tool-tpg.firebaseio.com"
});

let db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
    await Promise.map(collectionPath, async (collection, inx) => {
      let collectionRef = db.collection(collection);
      let query = collectionRef.orderBy('__name__').limit(batchSize);
          
      return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
      });
      
    })
    console.log ("Deleted All")
  }
  
  function deleteQueryBatch(db, query, batchSize, resolve, reject) {
      console.log("deleting")
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
          return 0;
        }
  
        // Delete documents in a batch
        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
  
        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }
  
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
      })
      .catch(reject);
}

collections = ['cards', 'unavailable', 'reviews']

async function test () {
  await deleteCollection(db, collections, 500)
  console.log("All done")
}


exports.delete = async(req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')

  await deleteCollection(db, collections, 500)

    return res.status(200).send(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
 }

  
