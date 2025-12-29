import { useState, useRef, useEffect } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

const SelectField = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    const syntheticEvent = {
      target: { value: optionValue },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative" ref={dropdownRef}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full ${
            Icon ? "pl-10" : "pl-3"
          } pr-10 py-2.5 border rounded-lg text-base transition-colors duration-200 text-left ${
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "bg-white cursor-pointer hover:border-gray-400"
          } ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-pink-500 focus:ring-pink-500"
          } focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
            !selectedOption ? "text-gray-400" : "text-gray-900"
          }`}
        >
          <span className="block truncate">{displayValue}</span>
        </button>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {placeholder && (
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                    !value ? "bg-pink-50 text-pink-600" : "text-gray-700"
                  }`}
                >
                  {placeholder}
                </button>
              )}
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                    value === option.value
                      ? "bg-pink-50 text-pink-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SelectField;
