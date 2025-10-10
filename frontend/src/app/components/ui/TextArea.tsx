"use client";

import React, { TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, ...props }, ref) => (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-gray-300 text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        {...props}
        className={`w-full bg-gray-800 text-gray-200 rounded-lg border border-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition resize-none ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <span className="text-red-400 text-sm mt-1">{error}</span>}
    </div>
  )
);

TextArea.displayName = "TextArea";

export default TextArea;
