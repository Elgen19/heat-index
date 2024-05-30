const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

// Parse the JSON string from the environment variable
const firebaseServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount)
});

const db = admin.firestore();
const tokensCollection = db.collection('tokens');

// Function to calculate heat index
function calculateHeatIndex(tempCelsius, humidity) {
  console.log(`Calculating heat index for temp: ${tempCelsius}, humidity: ${humidity}`);
  const tempFahrenheit = (tempCelsius * 9/5) + 32;
  const heatIndex = -42.379 + 2.04901523 * tempFahrenheit + 10.14333127 * humidity
                    - 0.22475541 * tempFahrenheit * humidity
                    - 0.00683783 * Math.pow(tempFahrenheit, 2)
                    - 0.05481717 * Math.pow(humidity, 2)
                    + 0.00122874 * Math.pow(tempFahrenheit, 2) * humidity
                    + 0.00085282 * tempFahrenheit * Math.pow(humidity, 2)
                    - 0.00000199 * Math.pow(tempFahrenheit, 2) * Math.pow(humidity, 2);
  return (heatIndex - 32) * 5/9; // Convert back to Celsius
}

// Function to fetch weather data and send notification if necessary
async function checkWeatherAndSendNotification() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = 'Cebu'; // Replace with your city
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  console.log('Fetching weather data from OpenWeather API');
  try {
    const response = await axios.get(url);
    const { temp } = response.data.main;
    const { humidity } = response.data.main;

    const heatIndex = calculateHeatIndex(temp, humidity);
    console.log(`Current Heat Index: ${heatIndex}°C`);

    if (heatIndex > 32) {
      const snapshot = await tokensCollection.get();
      const registrationTokens = snapshot.docs.map(doc => doc.data().token);

      if (registrationTokens.length > 0) {
        const message = {
          notification: {
            title: 'Heat Alert',
            body: `The current heat index is ${heatIndex.toFixed(2)}°C, prolonged exposure to heat can result to heat cramps!`
          },
          tokens: registrationTokens // Send notification to all registered devices
        };

        console.log('Sending notification to FCM');
        console.log('Tokens being used:', registrationTokens); // Log the tokens before sending
        try {
          const response = await admin.messaging().sendMulticast(message);
          console.log('Successfully sent message:', response);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }

    // Return weather data
    return { temp, humidity, heatIndex };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Error fetching weather data');
  }
}


// Netlify function handler
const handler = async (event, context) => {
  console.log('Received event:', event);
  if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/check-weather') {
    const { token } = JSON.parse(event.body);
    console.log('Received token:', token);

    // Store token in Firestore
    try {
      await tokensCollection.doc(token).set({ token });
      console.log('Registration token stored:', token);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Token received and stored successfully' })
      };
    } catch (error) {
      console.error('Error storing token:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error storing token' })
      };
    }
  } else if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/check-weather') {
    console.log('Checking weather and sending notifications if necessary');
    const weatherData = await checkWeatherAndSendNotification();
    return {
      statusCode: 200,
      body: JSON.stringify(weatherData)
    };
  } else {
    console.log('Invalid HTTP method or path:', event.httpMethod, event.path);
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};

// Export the handler function
module.exports = { handler };