import firebase from '../helpers/firebase'

const firestoreCollectionToArray = (
  documentData: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) => {
  const datas: firestoreCollectionToArray.Data[] = []
  documentData.forEach( document => {
    const data = document.data()
    datas.push( Object.assign( data, { doc: document.id } ) )
  } )
  return datas
}

firestoreCollectionToArray.promise = (
  promise: Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>
) => promise.then( firestoreCollectionToArray )

firestoreCollectionToArray.collection = (
  collection: string
) => firebase.firestore().collection( collection ).get().then( firestoreCollectionToArray )

namespace firestoreCollectionToArray {
  export type Data = {
    [key: string]: any
  } & { doc: string }
}

export default firestoreCollectionToArray
