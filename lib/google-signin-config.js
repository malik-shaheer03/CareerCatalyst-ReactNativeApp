import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '561831437444-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with actual web client ID from Firebase Console
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '561831437444-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info.plist file, new name here, e.g. GoogleService-Info-Staging
  openIdConnect: true, // [iOS] The OpenID Connect auth flow is used to retrieve user info
});

// For testing purposes, you can temporarily disable Google Sign-In
// by commenting out the above configuration and uncommenting below:
/*
GoogleSignin.configure({
  webClientId: '', // Empty string disables Google Sign-In
});
*/

export default GoogleSignin;
