"use client";

import { useState } from "react";
import {Control, Controller, FieldError, FieldValues} from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import countries from "world-countries";

/* ---------------- Country List ---------------- */

type CountryOption = {
    label: string;
    value: string;
    flag: string;
};

const countryOptions: CountryOption[] = countries.map((c) => ({
    label: c.name.common,
    value: c.cca2,
    flag: c.flag,
}));

/* ---------------- Props ---------------- */

type CountrySelectProps = {
    name: string;
    label: string;
    control: Control<FieldValues>;
    error?: FieldError;
    required?: boolean;
};

/* ---------------- Dropdown ---------------- */

const CountrySelect = ({
                           value,
                           onChange,
                       }: {
    value: string;
    onChange: (value: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const selected = countryOptions.find((c) => c.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    role="combobox"
                    variant="default"
                    className="w-full flex items-center justify-between"
                >
                    {selected ? (
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{selected.flag}</span>
                            <span>{selected.label}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">Select your country…</span>
                    )}

                    {/* Arrow ALWAYS on the right */}
                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
            </PopoverTrigger>

            <PopoverContent  className="bg-black-border border-gray-700">
                <Command className="bg-black text-white">
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {countryOptions.map((country) => (
                                <CommandItem
                                    key={country.value}
                                    value={country.label}
                                    onSelect={() => {
                                        onChange(country.value);
                                        setOpen(false);
                                    }}
                                    className="bg-black text-white hover:bg-gray-800"
                                >
                                    <span className="text-lg">{country.flag}</span>
                                    <span>{country.label}</span>

                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === country.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

/* ---------------- Form Field ---------------- */

export const CountrySelectField = ({
                                       name,
                                       label,
                                       control,
                                       error,
                                       required = false,
                                   }: CountrySelectProps) => {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render={({ field }) => (
                    <CountrySelect value={field.value || ""} onChange={field.onChange} />
                )}
            />

            {error && <p className="text-sm text-red-500">{error.message}</p>}
            <p className="text-xs text-gray-500">
                Helps us show market data and news relevant to you.
            </p>
        </div>
    );
};