
const admin = require('firebase-admin');
const serviceAccount = require('./key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://compliance-tool-tpg.firebaseio.com"
});

let db = admin.firestore();

function deleteCollection(db, collectionPath, batchSize) {
    console.log(collectionPath)
    collectionPath.forEach(collection => {
        console.log(collection)
    let collectionRef = db.collection(collection);
    let query = collectionRef.orderBy('__name__').limit(batchSize);
        
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
    })

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


exports.delete = async(req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')

  await deleteCollection(db, collections, 100)

    return res.status(200).send(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
 }
  deleteCollection(db, collections, 1500)

  
  