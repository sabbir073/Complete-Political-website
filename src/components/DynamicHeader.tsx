/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getHeaderSettings } from "@/lib/getHeaderSettings";
import Header from "./Header";

export default async function DynamicHeader() {
  // Pre-fetch settings on the server side to eliminate FOUC
  const settings = await getHeaderSettings();
  
  // Pass the pre-fetched settings to the client component
  return <Header initialSettings={settings} />;
}