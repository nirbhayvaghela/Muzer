import axios from "axios";

export const apiClient = axios.create({
  baseURL: '/api',
});

// apiClient.interceptors.request.use(
//   (config) => {
//     const token = LocalStorageGetItem("userData")?.token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Prevent caching
//     config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
//     config.headers["Pragma"] = "no-cache";
//     config.headers["Expires"] = "0";

//     // console.log(config.headers.Authorization);
//     return config;
//   },
//   (error) => Promise.reject(error)
// );