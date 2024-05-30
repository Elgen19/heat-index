const axios = require('axios');

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

exports.handler = async (event, context) => {
  console.log('Fetching weather data without sending notifications');
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const city = 'Cebu'; // Replace with your city
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const { temp, humidity } = response.data.main;

    // Calculate heat index
    const heatIndex = calculateHeatIndex(temp, humidity);

    // Return weather data
    return {
      statusCode: 200,
      body: JSON.stringify({ temp, humidity, heatIndex })
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching weather data' })
    };
  }
};
