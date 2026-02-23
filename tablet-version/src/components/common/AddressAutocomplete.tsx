import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Search, X, RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock address suggestions
const mockAddressSuggestions = [
  { street: "123 Main Street", city: "Chicago", state: "IL", zipcode: "60601", country: "United States" },
  { street: "456 Oak Avenue", city: "Chicago", state: "IL", zipcode: "60602", country: "United States" },
  { street: "789 Pine Road", city: "Chicago", state: "IL", zipcode: "60603", country: "United States" },
  { street: "321 Elm Boulevard", city: "Los Angeles", state: "CA", zipcode: "90001", country: "United States" },
  { street: "654 Maple Drive", city: "Los Angeles", state: "CA", zipcode: "90002", country: "United States" },
  { street: "987 Cedar Lane", city: "New York", state: "NY", zipcode: "10001", country: "United States" },
  { street: "147 Birch Court", city: "New York", state: "NY", zipcode: "10002", country: "United States" },
  { street: "258 Walnut Street", city: "Houston", state: "TX", zipcode: "77001", country: "United States" },
  { street: "369 Cherry Avenue", city: "Phoenix", state: "AZ", zipcode: "85001", country: "United States" },
  { street: "741 Spruce Road", city: "Philadelphia", state: "PA", zipcode: "19101", country: "United States" },
];

export interface AddressData {
  streetAddress: string;
  zipcode: string;
  country: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  showHeading?: boolean;
  required?: boolean;
  className?: string;
}

const AddressAutocomplete = ({
  value,
  onChange,
  showHeading = true,
  required = true,
  className,
}: AddressAutocompleteProps) => {
  const [addressSearch, setAddressSearch] = useState(value.streetAddress || "");
  const [addressOpen, setAddressOpen] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(!!value.streetAddress && !!value.zipcode);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const [debouncedAddressSearch, setDebouncedAddressSearch] = useState("");
  const addressSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    if (value.streetAddress && value.streetAddress !== addressSearch) {
      setAddressSearch(value.streetAddress);
      setIsAddressSelected(!!value.streetAddress && !!value.zipcode);
    }
  }, [value.streetAddress]);

  // Debounce address search input (300ms)
  useEffect(() => {
    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
    }

    if (addressSearch.length >= 3 && !isAddressSelected) {
      setIsSearchingAddress(true);
      addressSearchTimeoutRef.current = setTimeout(() => {
        setDebouncedAddressSearch(addressSearch);
        setIsSearchingAddress(false);
      }, 300);
    } else {
      setDebouncedAddressSearch("");
      setIsSearchingAddress(false);
    }

    return () => {
      if (addressSearchTimeoutRef.current) {
        clearTimeout(addressSearchTimeoutRef.current);
      }
    };
  }, [addressSearch, isAddressSelected]);

  // Filter address suggestions based on debounced search
  const filteredAddressSuggestions = debouncedAddressSearch.length >= 3
    ? mockAddressSuggestions.filter(addr =>
        addr.street.toLowerCase().includes(debouncedAddressSearch.toLowerCase()) ||
        addr.city.toLowerCase().includes(debouncedAddressSearch.toLowerCase()) ||
        addr.zipcode.includes(debouncedAddressSearch)
      )
    : [];

  // Handle address selection from autocomplete
  const handleAddressSelect = (address: typeof mockAddressSuggestions[0]) => {
    const fullStreet = `${address.street}, ${address.city}, ${address.state}`;
    const fullAddress = `${fullStreet}, ${address.zipcode}, ${address.country}`;

    setAddressSearch(fullStreet);
    setAddressOpen(false);
    setIsAddressSelected(true);
    setAddressTouched(false);
    setDebouncedAddressSearch("");

    onChange({
      streetAddress: fullStreet,
      zipcode: address.zipcode,
      country: address.country,
      fullAddress,
    });
  };

  // Handle clearing the selected address
  const handleClearAddress = () => {
    setAddressSearch("");
    setIsAddressSelected(false);
    setAddressTouched(false);
    setDebouncedAddressSearch("");

    onChange({
      streetAddress: "",
      zipcode: "",
      country: "",
      fullAddress: "",
    });
  };

  // Handle address input change with re-enable autocomplete
  const handleAddressInputChange = (inputValue: string) => {
    setAddressSearch(inputValue);
    setAddressTouched(true);

    // If user edits after selection, clear Country & Zipcode and re-enable autocomplete
    if (isAddressSelected) {
      setIsAddressSelected(false);
      onChange({
        streetAddress: "",
        zipcode: "",
        country: "",
        fullAddress: "",
      });
    }

    // Open dropdown if >= 3 chars
    if (inputValue.length >= 3) {
      setAddressOpen(true);
    } else {
      setAddressOpen(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Job Address Section Heading */}
      {showHeading && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <Label className="text-base font-semibold">Job Address</Label>
        </div>
      )}

      {/* Street Address with Autocomplete */}
      <div>
        <Label htmlFor="street-address">
          Street Address {required && <span className="text-red-500">*</span>}
        </Label>
        <Popover open={addressOpen && !isAddressSelected} onOpenChange={(open) => {
          if (!isAddressSelected) {
            setAddressOpen(open);
          }
        }}>
          <PopoverTrigger asChild>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="street-address"
                type="text"
                value={addressSearch}
                onChange={(e) => handleAddressInputChange(e.target.value)}
                onFocus={() => {
                  if (addressSearch.length >= 3 && !isAddressSelected) {
                    setAddressOpen(true);
                  }
                }}
                onBlur={() => {
                  // Small delay to allow click on dropdown items
                  setTimeout(() => {
                    if (addressSearch.length > 0 && !isAddressSelected) {
                      setAddressTouched(true);
                    }
                  }, 200);
                }}
                placeholder="Start typing to search address..."
                className={cn(
                  "h-11 pl-10 pr-10",
                  isAddressSelected && "bg-gray-50 border-green-300"
                )}
              />
              {isAddressSelected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAddress();
                  }}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              ) : isSearchingAddress && (
                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-hidden"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={4}
          >
            {isSearchingAddress ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Searching addresses...
              </div>
            ) : filteredAddressSuggestions.length > 0 ? (
              <Command shouldFilter={false}>
                <CommandList className="max-h-60">
                  <CommandGroup>
                    {filteredAddressSuggestions.map((addr, index) => (
                      <CommandItem
                        key={index}
                        value={`${addr.street}-${index}`}
                        onSelect={() => handleAddressSelect(addr)}
                        className="cursor-pointer py-3 px-4 hover:bg-orange-50"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-gray-900">
                            {addr.street}, {addr.city}, {addr.state} {addr.zipcode}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {addr.country}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            ) : debouncedAddressSearch.length >= 3 ? (
              <div className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 mb-2 text-gray-300" />
                No matching addresses found
              </div>
            ) : null}
          </PopoverContent>
        </Popover>

        {/* Validation message for required address */}
        {required && addressTouched && !isAddressSelected && (
          <p className="text-xs text-red-500 mt-1">Please select a valid address</p>
        )}
      </div>

      {/* Additional Address Fields */}
      <div className="grid grid-cols-2 gap-3">
        {/* Zipcode */}
        <div>
          <Label htmlFor="zipcode">Zipcode {required && <span className="text-red-500">*</span>}</Label>
          <Input
            id="zipcode"
            type="text"
            value={value.zipcode}
            placeholder="Enter zipcode"
            className="mt-2 h-11"
            onChange={(e) =>
              onChange({
                ...value,
                zipcode: e.target.value,
                fullAddress: value.streetAddress ? `${value.streetAddress}, ${e.target.value}, ${value.country}` : "",
              })
            }
            disabled={!isAddressSelected}
          />
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country">Country {required && <span className="text-red-500">*</span>}</Label>
          <Input
            id="country"
            type="text"
            value={value.country}
            placeholder="Enter country"
            className="mt-2 h-11"
            onChange={(e) =>
              onChange({
                ...value,
                country: e.target.value,
                fullAddress: value.streetAddress ? `${value.streetAddress}, ${value.zipcode}, ${e.target.value}` : "",
              })
            }
            disabled={!isAddressSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressAutocomplete;
