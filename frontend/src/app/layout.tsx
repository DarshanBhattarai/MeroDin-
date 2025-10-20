// src/app/layout.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/app/store";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthProvider>{children}</AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
