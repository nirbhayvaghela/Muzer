
import toast from "react-hot-toast";

enum ErrorCode {
  TokenExpired = 410, // Expired token
  Unauthorized = 401, // Token is completely invalid, redirect to login
  // PasswordExpired = 410, // Custom error for password expiration
}

export const errorHandler = async (code: number) => {
  console.log(code, "code");
  if (code === ErrorCode.TokenExpired || code === ErrorCode.Unauthorized) {
    window.location.href = `/`;
    toast.error("Token expired. Please login again.");
    localStorage.clear();
  }
};

// const logout = async () => {
//   await localStorage.removeItem("referal-summery-manegment");
//   window.location.href = `${import.meta.env.VITE_WEB_URL}/login`;
// };
