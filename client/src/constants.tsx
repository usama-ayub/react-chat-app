export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTES = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTES = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE = `${AUTH_ROUTES}/remove-profile-image`;
export const LOGOUT = `${AUTH_ROUTES}/logout`;


export const CONTACT_ROUTES = "api/contact";
export const SEARCH_CONTACT_ROUTES = `${CONTACT_ROUTES}/search`;
export const GET_DM_CONTACTS = `${CONTACT_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS = `${CONTACT_ROUTES}/get-all-contacts`;

export const MESSAGE_ROUTES = "api/message";
export const GET_ALL_MESSAGES = `${MESSAGE_ROUTES}/get-messages`;
export const UPLOAD_FILE = `${MESSAGE_ROUTES}/upload-file`;

export const CHANNEL_ROUTES = "api/channel";
export const CREATE_CHANNEL = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNELS = `${CHANNEL_ROUTES}/get-user-channels`;
export const GET_CHANNEL_MESSAGES = `${CHANNEL_ROUTES}//get-channel-messages`;