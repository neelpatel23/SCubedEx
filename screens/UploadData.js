const admin = require('firebase-admin');
const serviceAccount = require('../scubed-eda81-firebase-adminsdk-cr7u1-d020a27ef1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Initialize Firestore database

const users =
[
    {
      "userEmail": "neel@tesla.com",
      "displayName": "Neel",
      "firstName": "Neel",
      "lastName": "Patel",
      "center": "Munster",
      "group": "K2"
    },
  ]

  users.forEach(user => {
    admin.auth().createUser({
      email: user.userEmail,
      emailVerified: false,
      password: 'SCubed24', // You should set a secure password
      displayName: user.displayName,
      disabled: false
    })
    .then((userRecord) => {
      console.log('Successfully created new user:', userRecord.uid);
  
      // Prepare user data with the additional 'role' field
      const userData = {
        uid: userRecord.uid,
        email: user.userEmail,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        center: user.center,
        group: user.group
      };
  
      // Store the user data in Firestore
      db.collection('userData').doc(userRecord.uid).set(userData)
        .then(() => console.log(`User data stored in Firestore for ${user.email}`))
        .catch(error => console.error(`Error storing user data in Firestore for ${user.email}:`, error));
    })
    .catch((error) => {
      console.log('Error creating new user:', error);
    });
  });

