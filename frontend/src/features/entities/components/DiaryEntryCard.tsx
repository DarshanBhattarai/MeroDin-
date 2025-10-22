"use client";

import React from "react";
import { securityUtils } from "@/utils/securityUtils";

interface DiaryEntryCardProps {
  entry: any;
  onDelete?: (id: string) => void;
}

const getDiaryTypeColor = (type?: string) => {
  switch (type) {
    case "NORMAL":
      return "bg-blue-100 text-blue-800";
    case "PRIVATE":
      return "bg-purple-100 text-purple-800";
    case "WORK":
      return "bg-green-100 text-green-800";
    case "PERSONAL":
      return "bg-yellow-100 text-yellow-800";
    case "TRAVEL":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, onDelete }) => {
  const decryptSafe = (value?: string) => {
    try {
      return value ? securityUtils.decryptData(value) : "";
    } catch {
      return value || "";
    }
  };

  const title = decryptSafe(entry?.title);
  const content = decryptSafe(entry?.contentRaw);
  const location = decryptSafe(entry?.location);
  const passwordHint = decryptSafe(entry?.passwordHint);

  const diaryType = entry?.diaryType?.replace("_", " ") || "N/A";
  const typeColor = getDiaryTypeColor(entry?.diaryType);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 truncate">{title || "Untitled"}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
          {diaryType}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{content || "No content available."}</p>

      {location && <p className="text-sm text-gray-500 mb-3">📍 {location}</p>}

      {entry?.isLocked && (
        <div className="mt-3 flex items-center text-sm text-yellow-600">
          🔒 Locked {passwordHint ? `- Hint: ${passwordHint}` : ""}
        </div>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(entry?.id)}
          className="mt-4 text-sm text-red-600 hover:text-red-800 transition"
        >
          Delete
        </button>
      )}
    </div>
  );
};
