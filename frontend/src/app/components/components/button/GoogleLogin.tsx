"use client";

import React from "react";
// import { useGoogleLogin } from "@react-oauth/google";

const GoogleLoginButton: React.FC = () => {
//   const googleLogin = useGoogleLogin({
//     onSuccess: (authResult: { code?: string }) => {
//       console.log("Google auth code:", authResult.code);
//     },
//     onError: (error) => console.error("Google login error:", error),
//     flow: "auth-code",
//   });

  return (
    <button
      type="button"
    //   onClick={() => googleLogin()}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg shadow hover:shadow-md hover:bg-gray-100 transition-all duration-200 active:scale-95 w-full"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 533.5 544.3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M533.5 278.4c0-17.4-1.4-34-4.2-50.2H272v95.1h146.9c-6.4 34.6-25.6 63.8-54.7 83.3l88.4 68.8c51.7-47.6 81.9-117.7 81.9-196.9z"
          fill="#4285F4"
        />
        <path
          d="M272 544.3c73.9 0 135.8-24.4 181.1-66.2l-88.4-68.8c-24.6 16.5-56.3 26.3-92.7 26.3-71 0-131.1-47.9-152.6-112.2l-89.8 69.2C66.1 490.5 161.4 544.3 272 544.3z"
          fill="#34A853"
        />
        <path
          d="M119.4 323.4c-10.3-30.7-10.3-63.7 0-94.4l-89.8-69.2C-7.3 230.6-7.3 313.6 29.6 385l89.8-69.2z"
          fill="#FBBC05"
        />
        <path
          d="M272 107.7c39.9 0 75.8 13.7 104 40.7l77.6-77.6C407.8 25.6 345.9 0 272 0 161.4 0 66.1 53.9 29.6 138.4l89.8 69.2c21.5-64.3 81.6-112.2 152.6-112.2z"
          fill="#EA4335"
        />
      </svg>
      <span className="text-sm font-medium">Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
