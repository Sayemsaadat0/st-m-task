"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  // Calculate dynamic height based on selections
  const buttonMinHeight = selectedLabels.length > 0 ? "min-h-[2.75rem]" : "h-11";
  const buttonPadding = selectedLabels.length > 2 ? "py-3" : "py-2";

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full px-3 border border-t-gray/30 bg-t-black text-white outline-none flex items-center justify-between gap-2 text-left focus:border-t-green transition-colors",
          buttonMinHeight,
          buttonPadding,
          className
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-6items-center">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, idx) => {
              const option = options.find((opt) => opt.label === label);
              return (
                <span
                  key={option?.value || idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-t-green/20 border border-t-green/30 rounded-full text-sm text-white"
                >
                  {label}
                  <span
                    onClick={(e) => removeOption(option?.value || "", e)}
                    className="hover:bg-t-green/30 rounded-md p-0.5 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeOption(option?.value || "", e as any);
                      }
                    }}
                  >
                    <XIcon className="w-3 h-3" />
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-white/50">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={cn(
            "w-4 h-4 transition-transform text-white/50 shrink-0",
            open && "transform rotate-180"
          )}
        />
      </button>

      {open && (
        <div 
          className={cn(
            "absolute z-[9999] mt-1 bg-t-black border border-t-gray/30 shadow-xl overflow-auto",
            "w-full",
            "max-h-48"
          )}
        >
          <div className="p-1">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors rounded-sm",
                    isSelected 
                      ? "bg-t-green/20 text-white" 
                      : "hover:bg-t-gray/10 text-white/90"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center shrink-0",
                      isSelected ? "bg-t-green border-t-green" : "border-t-gray/30"
                    )}
                  >
                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

