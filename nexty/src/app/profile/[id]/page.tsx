"use client";
import { useParams } from "next/navigation";

export default function UserProfile() {
  const params = useParams(); // { id: "123" }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">
        Hi {params.id} This is your profile page.
      </h1>
    </div>
  );
}
