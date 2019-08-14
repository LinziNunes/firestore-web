
const admin = require('firebase-admin');
const serviceAccount = require('./key.json')
const Promise = require('bluebird')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://compliance-tool-tpg.firebaseio.com"
  });
  
  let db = admin.firestore();

async function readData(db, collectionPath, batchSize) {
    let counter = 1 
    let collectionRef = db.collection(collectionPath)
    let query = collectionRef.orderBy('__name__').limit(batchSize);
    console.log(counter)
    let rows;
      //while (counter != 0) {
         return new Promise((resolve, reject) => {
            console.log ('here')
            rows = readQueryBatch(db, query, 0, batchSize, resolve, reject)
            console.log(rows)

        })

  }
  
  function readQueryBatch(db, query, startpoint, batch, resolve, reject) {
    let length = undefined
    if (startpoint > 0) {
        query = query.startAfter(last)
    }
    //console.log(query)
    return query.get()
      .then((snapshot) => {
        //if (snapshot.docs.length > 0) {
        length = snapshot.docs.length
        last = snapshot.docs[snapshot.docs.length - 1];
        // Delete documents in a batch
        snapshot.forEach((doc) => {
            let row = doc.data().obj;
            row.key = doc.id
            //console.log(row)
            rows.push (row)
        })
  
        if (length == 0) {
            console.log( "emd" + length )
            resolve()
            return;
          }
        
        return rows

    }).then (res =>{
        
        startpoint += batch
        console.log(startpoint)
        process.nextTick(() => {
            readQueryBatch(db, query, startpoint, batch, resolve, reject);
          });

    })


        // return batch.commit().then(() => {
        //   return snapshot.size;
        // });
      
  
        // Recurse on the next process tick, to avoid
        // exploding the stack.
       
      }
     
readData(db, 'cards', 100)