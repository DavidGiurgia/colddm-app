import AuthProvider from "@/lib/providers/AuthProvider";
import React from "react";

const PrivateLayout = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default PrivateLayout;
