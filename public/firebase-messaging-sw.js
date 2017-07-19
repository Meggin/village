// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
importScripts('https://www.gstatic.com/firebasejs/4.1.2/firebase-database.js');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCs7q_-V-bq_PVI5zf0n1FqURwewgWneT0",
  authDomain: "villageassistant-ly3.firebaseapp.com",
  databaseURL: "https://villageassistant-ly3.firebaseio.com",
  projectId: "villageassistant-ly3",
  storageBucket: "villageassistant-ly3.appspot.com",
  messagingSenderId: "103953800507"
};
firebase.initializeApp(config);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

const db = firebase.database();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Payload received: ', payload);

  const parsedJSON = JSON.parse(payload.data.jsondata);

  console.log("What does the actions key look like? " + payload.data.actionID);

  console.log("What does the needy user ID look like? " + payload.data.needyUserID);

  console.log("What does actions look like? " + parsedJSON.actions);

  console.log("What does title look like? " + parsedJSON.title);

  const actionID = (payload.data.actionID).toString();

  const needyUserID = (payload.data.needyUserID).toString();

  const notificationTitle = parsedJSON.title;

  const parsedBody = parsedJSON.body;

  const parsedActions = parsedJSON.actions;

  // Customize notification here
  const notificationOptions = {
    body: parsedBody,
    actions: parsedActions,
    data: {
      actionRecord: actionID,
      needyUserRecord: needyUserID
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    
    event.notification.close();

    const myPromise = new Promise(function(resolve, reject) {

      if (!event.action) {

        // Was normal notificaiton click
        console.log("User clicked notification but didn't answer.");

      } else if (event.action === 'yes') {

        console.log("User said yes.");

        const databaseRef = db.ref('/testvillage/responseYesCount');

        databaseRef.transaction(function(currentYesCount) {
          return currentYesCount+1;
        });

        //const notificationData = event.notification.data.actionRecord;

        //const needyUserData = event.notification.data.needyUserRecord;

        //console.log("And now we can read the action record, I hope: " + notificationData);

        //console.log("And now we can read the needy user record, I hope: " + needyUserData);

        //const databaseRef = db.ref('/user-actions/' + needyUserData + '/actions/' + notificationData + '/yesResponses');

        //databaseRef.transaction(function(currentYesCount) {
          //return currentYesCount+1;
        //});

      } else if (event.action === 'no') {

        console.log("User said no.");
      } else {

        console.log("Unknown action clicked: '$event.action'");
      }

    // Once finished, call resolve() or  reject().
    resolve();
  });

  event.waitUntil(myPromise);

  // Do something as the result of the notification click
});

self.addEventListener('notificationclose', e => console.log("User closed notification " + e.notification));

