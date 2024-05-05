"use client";

import { useUser } from "@/lib/auth";
import { ReactNode } from "react";
import Header from "../components/Header";
import { redirect, useRouter } from "next/navigation";
import { FetchDataProvider } from "@/context/admin/fetchDataContext";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = useUser();
  const router = useRouter();
  if (user === false) return <>Auth loading...</>;
  if (!user) return redirect("/");
  return (
    
    <FetchDataProvider>
      <div>
        <Header />
        {children}
      </div>
    </FetchDataProvider>
  );
}
