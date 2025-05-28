import React from "react";

const Login = () => {
  // This page is now disabled because authentication is removed.
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center text-red-600">
        Login is disabled
      </h2>
      <p className="text-center">
        Authentication is not required. You can use the app directly.
      </p>
    </div>
  );
};

export default Login;
