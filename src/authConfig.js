export const msalConfig = {
  auth: {
    // Application (client) ID
    clientId: "88971d1a-3fc0-47ce-90a2-b3fe30a9b0bb",

    // Directory (tenant) ID
    authority: "https://login.microsoftonline.com/5a6c337f-18ca-4028-be6c-d74ec4ce73bf",

    // 🚀 Updated: Production Redirect URI
    redirectUri: "https://pa-whereabouts.vercel.app/",
  },
  cache: {
    cacheLocation: "sessionStorage", 
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "User.ReadBasic.All"],
};