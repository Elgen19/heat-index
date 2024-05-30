*** App Breakdown ***
This project serves as a serverless endpoint for checking weather conditions in Cebu city. 
Specifically, it calculates the heat index in Celsius and sends a message using Firebase Cloud Messaging to produce a notification in an Android device if the heat index is above 32 degress Celsius.
This project uses OpenWeather API to calculate the heat index.
Firebase Cloud Messaging using Firebase Admin SDK is used to customize the notification.
The app uses tokens to send a notification to an Android device. The tokens are stored in a Firebase Firestore.
This project is hosted in Netlify.
Cron Job was used to periodically send notifications every one hour.

**********************************************************************************************************
** Prerequisites **
Open Weather API Key
In order for this server to work, you need to obtain the Open Weather API key. 
* Search for Open Weather API 
* Sign up if you dont have an account yet or Sign in.
* On the navigation bar, Go to <Your Name> tab for instance Elgen Prestosa.
* Select "My API Keys"
* You can generate a new API key by clicking the Generate button or just use the default.
* In your project, create a .env file and name the variable OPENWEATHER_API_KEY = <THE VALUE OF THE API KEY"

Firebase Service Account Key
* Sign in/ Sign up to Firebase
* Select or create a project
* On the left sidebar, select "Project Overview", click the gear icon and select "Project Settings".
* Select the "Service accounts" tab
* Click on Generate key button
* A JSON file will be downloaded. Open it and copy its contents to the .env  file and the variable FIREBASE_SERVICE_ACCOUNT

When your done, your .env file should look like this:

OPENWEATHER_API_KEY = "your_openweather_api_key"
FIREBASE_SERVICE_ACCOUNT = '{
    "type": "service_account",
    "project_id": "your_project_id",
    "private_key_id": "your_private_key_id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
    "client_email": "your_client_email@your_project_id.iam.gserviceaccount.com",
    "client_id": "your_client_id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your_client_email@your_project_id.iam.gserviceaccount.com"
  }'
**********************************************************************************************************

