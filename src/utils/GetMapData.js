import axios from 'axios';

// Function to check if the input is a numeric ID
const isNumeric = (value) => {
  return /^\d+$/.test(value);
};

// Function to extract mapset ID from the map link
const extractMapsetId = (input) => {
  const regex = /beatmapsets\/(\d+)/;
  const match = input.match(regex);
  return match ? match[1] : (isNumeric(input) ? input : null);
};

// Function to extract beatmap ID from the link if provided
const extractBeatmapId = (input) => {
  const regex = /#osu\/(\d+)/;
  const match = input.match(regex);
  return match ? match[1] : null;
};

// Main function to fetch map data based on the input
const GetMapData = async (mapLink) => {
  const mapsetId = extractMapsetId(mapLink);  // Extract mapset ID
  const beatmapId = extractBeatmapId(mapLink);  // Extract beatmap ID (if provided)

  try {
    // Get the OAuth access token first
    const tokenResponse = await axios.post('https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/token', {
      client_id: '35214',
      client_secret: 'K7JRxCslcyewEPwqdFVLCc7FT1oLmwD9hHIdfzVg',
      grant_type: 'client_credentials',
      scope: 'public',
    });

    const accessToken = tokenResponse.data.access_token;  // Store access token

    // If beatmapId is present, fetch data for the specific beatmap
    if (beatmapId) {
      const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;  // Return beatmap data
    }

    // If only mapsetId is present, fetch data for the mapset
    if (mapsetId) {
      const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/beatmapsets/${mapsetId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;  // Return mapset data
    }

    // If neither beatmapId nor mapsetId was found, throw an error
    throw new Error('Invalid map link: Could not extract beatmap or mapset ID.');

  } catch (err) {
    throw new Error(`Failed to fetch map data. Error: ${err.message}`);
  }
};

export default GetMapData;
