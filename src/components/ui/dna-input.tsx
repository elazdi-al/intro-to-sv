"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dna, 
  AlertCircle, 
  CheckCircle2, 
  Copy,
  Trash2,
  Info
} from 'lucide-react';

interface DNAInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  rows?: number;
  showGrouping?: boolean;
  showValidation?: boolean;
  showStatistics?: boolean;
}

export default function DNAInput({
  value,
  onChange,
  placeholder = "Entrez votre séquence ADN... (A, T, G, C)",
  label = "Séquence ADN (5' → 3')",
  id = "dna-sequence",
  rows = 4,
  showGrouping = true,
  showValidation = true,
  showStatistics = true
}: DNAInputProps) {
  const [rawInput, setRawInput] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clean and validate DNA sequence
  const cleanDNA = (sequence: string): string => {
    return sequence
      .toUpperCase()
      .replace(/[^ATGC]/g, '')
      .trim();
  };

  // Format DNA with grouping (triplets)
  const formatDNAWithGrouping = (sequence: string): string => {
    if (!showGrouping || !sequence) return sequence;
    return sequence.match(/.{1,3}/g)?.join(' ') || sequence;
  };

  // Get validation info
  const getValidationInfo = (sequence: string) => {
    const cleaned = cleanDNA(sequence);
    const invalidChars = sequence.toUpperCase().replace(/[ATGC\s\n\r\t]/g, '');
    
    return {
      cleaned,
      length: cleaned.length,
      invalidChars,
      hasInvalidChars: invalidChars.length > 0,
      isValid: cleaned.length > 0 && invalidChars.length === 0
    };
  };

  // Get base composition statistics
  const getBaseStats = (sequence: string) => {
    const cleaned = cleanDNA(sequence);
    if (!cleaned) return null;

    const counts = {
      A: (cleaned.match(/A/g) || []).length,
      T: (cleaned.match(/T/g) || []).length,
      G: (cleaned.match(/G/g) || []).length,
      C: (cleaned.match(/C/g) || []).length
    };

    const total = cleaned.length;
    const gcContent = Math.round(((counts.G + counts.C) / total) * 100);

    return {
      counts,
      total,
      gcContent,
      atContent: 100 - gcContent
    };
  };

  const validation = getValidationInfo(rawInput);
  const stats = getBaseStats(rawInput);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRawInput(newValue);
    
    // Update parent with cleaned DNA
    const cleaned = cleanDNA(newValue);
    onChange(cleaned);
  };

  // Handle base button clicks
  const handleBaseClick = (base: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = rawInput.substring(0, start);
    const after = rawInput.substring(end);
    const newValue = before + base + after;
    
    setRawInput(newValue);
    
    // Update cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
    
    const cleaned = cleanDNA(newValue);
    onChange(cleaned);
  };

  // Copy sequence to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(validation.cleaned);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Clear input
  const handleClear = () => {
    setRawInput('');
    onChange('');
    textareaRef.current?.focus();
  };

  // Sync external value changes
  useEffect(() => {
    if (value !== validation.cleaned) {
      setRawInput(value);
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          <Dna className="h-4 w-4" />
          {label}
        </Label>
        {showStatistics && stats && (
          <Badge variant="outline" className="text-xs">
            GC: {stats.gcContent}%
          </Badge>
        )}
      </div>

      {/* Base buttons for easy input */}
      <div className="flex gap-2">
        <div className="flex gap-1">
          {['A', 'T', 'G', 'C'].map((base) => (
            <Button
              key={base}
              variant="outline"
              size="sm"
              onClick={() => handleBaseClick(base)}
              className="w-8 h-8 p-0 font-mono font-bold"
              type="button"
            >
              {base}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {validation.cleaned && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1"
              type="button"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-1"
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Main textarea input */}
      <Textarea
        ref={textareaRef}
        id={id}
        placeholder={placeholder}
        value={rawInput}
        onChange={handleInputChange}
        className="font-mono text-sm"
        rows={rows}
      />

      {/* Validation and info display */}
      {showValidation && rawInput && (
        <div className="space-y-2">
          {validation.hasInvalidChars && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Caractères non valides détectés: <code>{validation.invalidChars}</code>
                <br />
                Seules les bases A, T, G, C sont acceptées.
              </AlertDescription>
            </Alert>
          )}

          {validation.cleaned && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Séquence nettoyée:</strong> {validation.length} bases
                  </div>
                  {showGrouping && (
                    <div className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                      {formatDNAWithGrouping(validation.cleaned)}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Statistics display */}
      {showStatistics && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          {Object.entries(stats.counts).map(([base, count]) => (
            <div key={base} className="bg-gray-50 p-2 rounded border">
              <div className="font-mono font-bold text-lg">{count}</div>
              <div className="text-xs text-gray-600">{base}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 