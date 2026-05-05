export const msalConfig = {
  auth: {
    // Application (client) ID
    clientId: "944ecd51-db39-4340-89e7-f86a17054de9",

    // Directory (tenant) ID
    authority: "https://login.microsoftonline.com/5a6c337f-18ca-4028-be6c-d74ec4ce73bf",

    // 🚀 Updated: Production Redirect URI
    redirectUri: "https://pa-whereabouts.vercel.app/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "User.ReadBasic.All"],
};
