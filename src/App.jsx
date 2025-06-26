import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cassouhzovotgdhzssqg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhc3NvdWh6b3ZvdGdkaHpzc3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTg5MjYsImV4cCI6MjA2NDY5NDkyNn0.dNg51Yn9aplsyAP9kvsEQOTHWb64edsAk5OqiynEZlk"
);

const extractPalletIDs = async (file) => {
  const text = await file.text();
  const matches = text.match(/\b\d{18}\b/g) || [];
  return Array.from(new Set(matches));
};

export default function App() {
  const [dropActive, setDropActive] = useState(false);
  const [status, setStatus] = useState("");

  const handleDrop = async (e) => {
    e.preventDefault();
    setDropActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (files.length === 0) {
      setStatus("⚠️ Only PDF files are supported.");
      return;
    }

    setStatus("🔍 Processing...");

    for (const file of files) {
      try {
        const palletIDs = await extractPalletIDs(file);
        const inserts = palletIDs.map(id => ({
          pallet_id: id,
          document_name: file.name,
          page_number: 1,
        }));

        const { error } = await supabase.from("NDAs").insert(inserts);
        if (error) throw error;
      } catch (err) {
        console.error(err);
        setStatus(`❌ Error processing ${file.name}`);
        return;
      }
    }

    setStatus("✅ Upload complete!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        className={`border-dashed border-4 rounded-2xl w-full max-w-2xl h-64 flex flex-col items-center justify-center transition-colors ${dropActive ? "border-blue-600 bg-blue-100" : "border-gray-400 bg-white"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={handleDrop}
      >
        <p className="text-lg text-gray-600">📂 Drag and drop PDF files here</p>
        <p className="text-sm text-gray-500 mt-1">Multiple files supported</p>
      </div>

      {status && <p className="mt-4 text-center text-md text-gray-700">{status}</p>}
    </div>
  );
}
