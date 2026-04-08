// ============================================================
// 📁 src/authConfig.js
// 把下面两个 ID 换成你在 Azure Portal 找到的真实值
// ============================================================

export const msalConfig = {
  auth: {
    // 👇 在 Azure Portal → App registrations → 你的 app → Overview
    //    第一行 "Application (client) ID" 复制过来
    clientId: "944ecd51-db39-4340-89e7-f86a17054de9",

    // 👇 同一个页面，第三行 "Directory (tenant) ID" 复制过来
    authority: "https://login.microsoftonline.com/5a6c337f-18ca-4028-be6c-d74ec4ce73bf",

    // 👇 这个先保持不动，本地开发用 localhost:3000
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "User.ReadBasic.All"], // 加这个
};