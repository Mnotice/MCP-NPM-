import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
const NWS_API_BASE = 'https://api.weather.gov';
const USER_AGENT = 'weather-app/1.0';
// Create server instance
const server = new McpServer({
    name: 'weather',
    version: '1.0.0',
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Utility function for error formatting
function _formatErrorMessage(message) {
    return {
        content: [
            {
                type: 'text',
                text: message,
            },
        ],
    };
}
// Enhanced NWS request function with retries
async function makeNWSRequest(url) {
    const headers = {
        'User-Agent': USER_AGENT,
        Accept: 'application/geo+json',
    };
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return (await response.json());
        }
        catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === 3) {
                return null; // Ensure function always returns a value
            }
        }
    }
    return null;
}
// Validation function for forecast response
function validateForecastResponse(data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data;
    if (!d || !d.properties || !Array.isArray(d.properties.periods)) {
        throw new Error('Invalid forecast response format');
    }
    return data;
}
// Format alert data
function formatAlert(feature) {
    const props = feature.properties;
    return [
        `Event: ${props.event || 'Unknown'}`,
        `Area: ${props.areaDesc || 'Unknown'}`,
        `Severity: ${props.severity || 'Unknown'}`,
        `Status: ${props.status || 'Unknown'}`,
        `Headline: ${props.headline || 'No headline'}`,
        '---',
    ].join('\n');
}
// Register weather tools
server.tool('get-alerts', 'Get weather alerts for a state', {
    state: z.string().length(2).describe('Two-letter state code (e.g. CA, NY)'),
}, async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest(alertsUrl);
    if (!alertsData) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Failed to retrieve alerts data',
                },
            ],
        };
    }
    const features = alertsData.features || [];
    if (features.length === 0) {
        return {
            content: [
                {
                    type: 'text',
                    text: `No active alerts for ${stateCode}`,
                },
            ],
        };
    }
    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join('\n')}`;
    return {
        content: [
            {
                type: 'text',
                text: alertsText,
            },
        ],
    };
});
// Updated get-forecast tool with proper content structure
server.tool('get-forecast', 'Get weather forecast for a location', {
    latitude: z.number().min(-90).max(90).describe('Latitude of the location'),
    longitude: z.number().min(-180).max(180).describe('Longitude of the location'),
}, async ({ latitude, longitude }) => {
    try {
        const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        const pointsData = await makeNWSRequest(pointsUrl);
        if (!pointsData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
                    },
                ],
            };
        }
        const forecastUrl = pointsData.properties?.forecast;
        if (!forecastUrl) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to get forecast URL from grid point data',
                    },
                ],
            };
        }
        const forecastData = await makeNWSRequest(forecastUrl);
        if (!forecastData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Failed to retrieve forecast data',
                    },
                ],
            };
        }
        const validatedData = validateForecastResponse(forecastData);
        const periods = validatedData.properties.periods;
        if (periods.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No forecast periods available',
                    },
                ],
            };
        }
        const formattedForecast = periods.map((period) => [
            `${period.name || 'Unknown'}:`,
            `Temperature: ${period.temperature || 'Unknown'}°${period.temperatureUnit || 'F'}`,
            `Wind: ${period.windSpeed || 'Unknown'} ${period.windDirection || ''}`,
            `${period.shortForecast || 'No forecast available'}`,
            '---',
        ].join('\n'));
        const forecastText = `Forecast for ${latitude}, ${longitude}:

${formattedForecast.join('\n')}`;
        return {
            content: [
                {
                    type: 'text',
                    text: forecastText,
                },
            ],
        };
    }
    catch (error) {
        console.error('Error in get-forecast tool:', error);
        return {
            content: [
                {
                    type: 'text',
                    text: 'An unexpected error occurred while fetching the forecast.',
                },
            ],
        };
    }
});
server.tool('get-historical-weather', 'Fetch historical weather data for a location', {
    latitude: z.number().min(-90).max(90).describe('Latitude of the location'),
    longitude: z.number().min(-180).max(180).describe('Longitude of the location'),
    startDate: z.string().describe('Start date in YYYY-MM-DD format'),
    endDate: z.string().describe('End date in YYYY-MM-DD format'),
}, async ({ latitude, longitude, startDate, endDate }) => {
    const historicalUrl = `${NWS_API_BASE}/historical?lat=${latitude}&lon=${longitude}&start=${startDate}&end=${endDate}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const historicalData = await makeNWSRequest(historicalUrl);
    if (!historicalData) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Failed to retrieve historical weather data',
                },
            ],
        };
    }
    // Format and return the data
    const formattedData = historicalData
        .map((entry) => `Date: ${entry.date}, Temperature: ${entry.temperature}°F, Conditions: ${entry.conditions}`)
        .join('\n');
    return {
        content: [
            {
                type: 'text',
                text: `Historical weather data:\n\n${formattedData}`,
            },
        ],
    };
});
server.tool('get-country-overview', 'Get a general overview for visiting a specific country', {
    country: z.string().describe('Name of the country to get an overview for'),
}, async ({ country }) => {
    const overviewData = {
        Indonesia: {
            weather: 'Tropical climate with high humidity. Expect warm temperatures year-round.',
            clothing: 'Light, breathable clothing is recommended. Bring rain gear during the wet season.',
            tips: 'Stay hydrated, use sunscreen, and be prepared for sudden rain showers.',
            subRegions: {
                Bali: {
                    weather: 'Warm and humid with occasional rain. Best time to visit is during the dry season (April to October).',
                    clothing: 'Light, casual clothing. Swimwear for beaches and modest attire for temples.',
                    tips: 'Respect local customs, especially in temples. Be cautious of traffic and tourist scams.',
                },
                Jakarta: {
                    weather: 'Hot and humid year-round with frequent rain, especially during the wet season (November to March).',
                    clothing: 'Light, breathable clothing. Bring an umbrella or raincoat.',
                    tips: 'Prepare for heavy traffic and urban heat. Stay hydrated.',
                },
            },
        },
        Turkey: {
            weather: 'Varies by region. Coastal areas have a Mediterranean climate, while inland areas have hot summers and cold winters.',
            clothing: 'Light clothing for summer, layers for cooler months. Modest attire is recommended for visiting mosques.',
            tips: 'Learn basic Turkish phrases. Be respectful of local customs and traditions.',
        },
        Qatar: {
            weather: 'Extremely hot summers with mild winters. Rain is rare.',
            clothing: 'Light, breathable clothing. Modest attire is required in public places.',
            tips: 'Stay hydrated and avoid outdoor activities during peak heat. Respect local dress codes.',
        },
        India: {
            weather: 'Diverse climate ranging from tropical in the south to temperate in the north. Monsoon season occurs from June to September.',
            clothing: 'Light, breathable clothing for most regions. Layers for cooler areas. Modest attire is recommended.',
            tips: 'Be cautious of food and water hygiene. Learn basic Hindi phrases for easier communication.',
        },
        USA: {
            weather: 'Varies greatly by region and season. Check the specific state or city for details.',
            clothing: 'Depends on the region and season. Layers are often a good choice.',
            tips: 'Plan for diverse climates if traveling across multiple states.',
        },
        // Add more countries as needed
    };
    const countryOverview = overviewData[country] || {
        weather: 'No specific data available for this country.',
        clothing: 'No specific data available for this country.',
        tips: 'No specific data available for this country.',
    };
    return {
        content: [
            {
                type: 'text',
                text: `Overview for ${country}:

Weather: ${countryOverview.weather}
Clothing: ${countryOverview.clothing}
Tips: ${countryOverview.tips}`,
            },
        ],
    };
});
// Uncomment the following lines to enable database integration
// import mongoose from "mongoose";
// // Database connection function
// async function connectToDatabase() {
//   try {
//     await mongoose.connect("mongodb://localhost:27017/weatherApp", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected to the database!");
//   } catch (error) {
//     console.error("Database connection error:", error);
//   }
// }
// // Define a schema for country overviews
// const CountryOverviewSchema = new mongoose.Schema({
//   country: { type: String, required: true },
//   weather: String,
//   clothing: String,
//   tips: String,
//   subRegions: Object,
// });
// // Create a model for country overviews
// const CountryOverview = mongoose.model("CountryOverview", CountryOverviewSchema);
// // Example usage of the database
// async function fetchCountryOverviewFromDB(country) {
//   try {
//     const overview = await CountryOverview.findOne({ country });
//     if (!overview) {
//       console.log("No data found for the specified country.");
//       return null;
//     }
//     return overview;
//   } catch (error) {
//     console.error("Error fetching data from the database:", error);
//     return null;
//   }
// }
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Weather MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
