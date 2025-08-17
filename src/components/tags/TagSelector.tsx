'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  className?: string;
}

const TAG_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', 
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937'
];

export function TagSelector({ selectedTagIds, onChange, className = '' }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id));

  const createTag = async (name: string): Promise<Tag | null> => {
    try {
      const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color: randomColor }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags(prev => [...prev, newTag]);
        return newTag;
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
    return null;
  };

  const addTag = async (tagName: string) => {
    const trimmedName = tagName.trim().toLowerCase();
    if (!trimmedName) return;

    // Buscar tag existente (case insensitive)
    let existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === trimmedName
    );

    // Si no existe, crearlo
    if (!existingTag) {
      const newTag = await createTag(trimmedName);
      if (!newTag) return;
      existingTag = newTag;
    }

    // Agregar a seleccionados si no está ya
    if (!selectedTagIds.includes(existingTag.id)) {
      onChange([...selectedTagIds, existingTag.id]);
    }

    setInputValue('');
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedTagIds.includes(tag.id)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    }
    
    if (e.key === 'Backspace' && !inputValue && selectedTagIds.length > 0) {
      // Eliminar el último tag si backspace en input vacío
      const newSelectedIds = [...selectedTagIds];
      newSelectedIds.pop();
      onChange(newSelectedIds);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleSuggestionClick = (tag: Tag) => {
    if (!selectedTagIds.includes(tag.id)) {
      onChange([...selectedTagIds, tag.id]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (isLoading) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      
      <div className="relative">
        <div className="border border-gray-300 rounded-md p-2 min-h-[2.5rem] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
          <div className="flex flex-wrap gap-1 items-center">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-black hover:bg-opacity-20"
                >
                  <X className="w-2 h-2" />
                </button>
              </span>
            ))}
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.trim() && setShowSuggestions(true)}
              placeholder={selectedTagIds.length === 0 ? "Escribe un tag y presiona Enter o coma..." : ""}
              className="flex-1 min-w-0 border-none outline-none bg-transparent text-sm placeholder-gray-400 text-gray-900 caret-gray-900"
              style={{ color: '#111827' }}
            />
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Escribe y presiona Enter, coma o Tab para agregar tags. Ej: &quot;sofia&quot;, &quot;simi&quot;
      </p>
    </div>
  );
}