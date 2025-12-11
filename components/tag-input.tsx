"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Dodaj kategorię...",
  disabled = false,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      (!maxTags || value.length < maxTags)
    ) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleAddClick = () => {
    addTag(inputValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddClick}
          disabled={
            disabled ||
            !inputValue.trim() ||
            value.includes(inputValue.trim()) ||
            (maxTags ? value.length >= maxTags : false)
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-sm px-3 py-1"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {maxTags && value.length >= maxTags && (
        <p className="text-sm text-muted-foreground">
          Maksymalna liczba kategorii: {maxTags}
        </p>
      )}
    </div>
  );
}
