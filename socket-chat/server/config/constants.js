// constants.js

// Message expiration interval
// ["1_hour", "1_day", "1_week", "1_month", "never"]
export const MESSAGE_EXPIRATION_TYPE = "never"; // options are included in "messageExpiration", room-model.js

// Message quantity
export const INITIAL_MESSAGE_LIMIT = 10; // fetch 10 messages upon user entering the room
export const MESSAGE_FETCH_LIMIT = 10; // fetch 10 older messages user scrolling to the top of conversation element

// Token expiration
export const ACCESS_TOKEN_EXPIRATION = process.env.NODE_ENV === "production" 
    ? 15*60*1000    // access token expires after 15 minutes 
    : 0.25*60*1000; // access token expires after 15 seconds

export const REFRESH_TOKEN_EXPIRATION = process.env.NODE_ENV === "production" 
    ? 30*60*1000    // refresh token expires after 30 minutes
    : 0.50*60*1000; // refresh token expires after 30 seconds