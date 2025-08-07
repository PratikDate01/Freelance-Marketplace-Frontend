import React from "react";

const AuthLayout = ({ title, points, children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left - Info */}
      <div className="bg-[#91274d] text-white flex flex-col justify-center px-10 py-20">
        <h1 className="text-4xl font-bold mb-6">{title}</h1>
        <ul className="space-y-3 text-lg">
          {points.map((point, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>✔</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Right - Form */}
      <div className="flex justify-center items-center p-10 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
