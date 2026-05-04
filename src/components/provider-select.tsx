"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from "@/components/ui/select";

const PROVIDERS = [
  {
    label: "Anthropic",
    options: [
      { value: "anthropic/claude-opus-4-7", label: "Claude Opus 4.7" },
      { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
    ],
  },
  {
    label: "OpenAI",
    options: [
      { value: "openai/gpt-4o", label: "GPT-4o" },
      { value: "openai/gpt-4o-mini", label: "GPT-4o mini" },
      { value: "openai/o1", label: "o1" },
    ],
  },
  {
    label: "Google",
    options: [
      { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
  },
  {
    label: "Mistral",
    options: [
      { value: "mistral/mistral-large-latest", label: "Mistral Large" },
    ],
  },
];

interface ProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProviderSelect({ value, onChange, disabled }: ProviderSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="min-w-[170px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROVIDERS.map((group, i) => (
          <SelectGroup key={group.label}>
            {i > 0 && <SelectSeparator />}
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
