import * as firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyDllzOjtpBu3djo6XYJG4slA3u1s2Cht8A",
    authDomain: "wibrary-88b80.firebaseapp.com",
    projectId: "wibrary-88b80",
    storageBucket: "wibrary-88b80.appspot.com",
    messagingSenderId: "606591642665",
    appId: "1:606591642665:web:6859df49a398a9e4460038"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();