"use client";

import {useState, useEffect, useRef, useCallback, KeyboardEvent} from 'react';

interface Suggestion {
  title: {
    text: string;
    hl?: Array<{ begin: number; end: number }>;
  };
  subtitle?: {
    text: string;
    hl?: Array<{ begin: number; end: number }>;
  };
  tags?: string[];
  distance?: {
    value: number;
    text: string;
  };
}

interface AddressInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const suggestionsCache = new Map<string, Suggestion[]>();

export default function AddressInput({value = '', onChange}: AddressInputProps) {
  const [address, setAddress] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastRequestTimeRef = useRef<number>(0);
  const pendingRequestRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setAddress(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.length < 3) return;

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;

    if (suggestionsCache.has(text)) {
      setSuggestions(suggestionsCache.get(text) || []);
      setShowSuggestions(true);
      setSelectedIndex(-1);
      return;
    }

    if (timeSinceLastRequest < 5000) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (pendingRequestRef.current === text) {
          performRequest(text);
        }
      }, 3000 - timeSinceLastRequest);

      pendingRequestRef.current = text;
      return;
    }

    performRequest(text);
  }, []);

  const performRequest = async (text: string) => {
    if (!text || text.length < 3) return;

    setLoading(true);
    lastRequestTimeRef.current = Date.now();
    pendingRequestRef.current = null;

    const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${process.env["NEXT_PUBLIC_GEOSUGGEST_API_KEY"]}&text=${encodeURIComponent(text)}&lang=ru_RU&results=5`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const results = data.results || [];

      suggestionsCache.set(text, results);

      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (address.length >= 3) {
        fetchSuggestions(address);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [address, fetchSuggestions]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAddress(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);

    if (newValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const selectedAddress = suggestion.title.text;
    setAddress(selectedAddress);
    onChange?.(selectedAddress);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    inputRef.current?.focus();
  };

  const renderHighlightedText = (textObj: { text: string; hl?: Array<{ begin: number; end: number }> }) => {
    if (!textObj.hl || textObj.hl.length === 0) {
      return <span>{textObj.text}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    const sortedHl = [...textObj.hl].sort((a, b) => a.begin - b.begin);

    for (const hl of sortedHl) {
      if (hl.begin > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {textObj.text.substring(lastIndex, hl.begin)}
          </span>
        );
      }

      parts.push(
        <span key={`hl-${hl.begin}`} className="text-blue-400 font-semibold">
          {textObj.text.substring(hl.begin, hl.end)}
        </span>
      );

      lastIndex = hl.end;
    }

    if (lastIndex < textObj.text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {textObj.text.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={handleAddressChange}
        onKeyDown={handleKeyDown}
        placeholder="Например: ул. Ленина, 10, зал №3"
        className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
        required
      />

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors text-white ${
                index === selectedIndex ? 'bg-slate-700' : 'hover:bg-slate-700'
              }`}
            >
              <div className="font-medium">
                {renderHighlightedText(suggestion.title)}
              </div>
              {suggestion.subtitle && (
                <div className="text-sm text-slate-400">
                  {renderHighlightedText(suggestion.subtitle)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="sr-only" aria-live="polite">
          Найдено {suggestions.length} подсказок. Используйте стрелки вверх и вниз для навигации.
        </div>
      )}
    </div>
  );
}