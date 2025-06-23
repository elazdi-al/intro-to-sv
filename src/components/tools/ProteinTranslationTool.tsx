"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import DNAInput from '@/components/ui/dna-input';
import { 
  Dna, 
  Target, 
  BarChart3, 
  FileText,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  cleanDNA, 
  findORFDetails, 
  getCodonBreakdown,
 
} from '@/lib/dna-utils';

interface ElectrophoresisPoint {
  size: number;
  intensity: number;
  isProtein: boolean;
  isSecondary: boolean;
}

interface RepeatPattern {
  pattern: string;
  length: number;
  count: number;
  aminoAcids: number;
  totalLength: number;
  start: number;
}

// Suffix array based repeat finder
const findRepeatsWithSuffixArray = (seq: string) => {
  const n = seq.length;
  if (n < 2) return [];

  // 1. Generate suffix array
  const suffixes = Array.from({ length: n }, (_, i) => ({
    index: i,
    suffix: seq.substring(i),
  }));

  // 2. Sort suffixes alphabetically
  suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix));

  const lcpArray = new Array(n).fill(0);
  // 3. Compute LCP (Longest Common Prefix) array
  for (let i = 1; i < n; i++) {
    const s1 = suffixes[i - 1].suffix;
    const s2 = suffixes[i].suffix;
    let j = 0;
    while (j < s1.length && j < s2.length && s1[j] === s2[j]) {
      j++;
    }
    lcpArray[i] = j;
  }

  // Find the longest repeat
  let longestRepeatLength = 0;
  let longestRepeatIndex = -1;
  for (let i = 0; i < n; i++) {
    if (lcpArray[i] > longestRepeatLength) {
      longestRepeatLength = lcpArray[i];
      longestRepeatIndex = i;
    }
  }

  if (longestRepeatIndex === -1 || longestRepeatLength < 3) return [];

  const pattern = suffixes[longestRepeatIndex].suffix.substring(0, longestRepeatLength);
  
  // Count occurrences of the pattern
  const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = [...seq.matchAll(regex)];
  
  const mainRepeat = {
    pattern,
    length: pattern.length,
    count: matches.length,
    aminoAcids: Math.floor(pattern.length / 3),
    totalLength: pattern.length * matches.length,
    start: matches.length > 0 ? matches[0].index ?? 0 : 0,
  };

  return [mainRepeat];
};

// Function to find the motif length (smallest repeating unit)
const findMotifLength = (pattern: string): number => {
  if (pattern.length <= 2) return pattern.length;
  
  // Find the shortest repeating pattern
  for (let len = 1; len <= Math.floor(pattern.length / 2); len++) {
    const motif = pattern.substring(0, len);
    let isRepeating = true;
    
    for (let i = len; i < pattern.length; i += len) {
      const chunk = pattern.substring(i, Math.min(i + len, pattern.length));
      if (!motif.startsWith(chunk)) {
        isRepeating = false;
        break;
      }
    }
    
    if (isRepeating) {
      return len;
    }
  }
  
  return pattern.length;
};

export default function ProteinTranslationTool() {
  const [rawSequence, setRawSequence] = useState('');

  // Exemple par défaut
  const exampleSequence = "ATGGTGAACGTGCAGCCCCGAAAGTGCATCTGGAATGATGATGATGATG";

  const cleanedDNA = useMemo(() => cleanDNA(rawSequence), [rawSequence]);
  const orfDetails = useMemo(() => 
    cleanedDNA ? findORFDetails(cleanedDNA) : null, 
    [cleanedDNA]
  );
  const codonBreakdown = useMemo(() => 
    orfDetails?.startPos ? getCodonBreakdown(cleanedDNA, orfDetails.startPos) : [],
    [cleanedDNA, orfDetails?.startPos]
  );
  
  // Analysis of repeat patterns for justification
  const repeatAnalysis = useMemo(() => {
    if (!cleanedDNA) return null;
    return findRepeatsWithSuffixArray(cleanedDNA);
  }, [cleanedDNA]);
  
  const { chartTicks, justificationText } = useMemo(() => {
    if (!cleanedDNA) return { chartTicks: [], justificationText: '' };

    const dnaLength = cleanedDNA.length;
    let ticks = [dnaLength]; // Main spike
    let text = `Il y a ${dnaLength} paires de bases, d'où un pic de fluorescence élevé à ${dnaLength} pb.`;

    if (repeatAnalysis && repeatAnalysis.length > 0) {
      const repeat = repeatAnalysis[0];
      const motifLength = findMotifLength(repeat.pattern);
      const motif = repeat.pattern.substring(0, motifLength);
      const pos1 = dnaLength - motifLength;
      const pos2 = dnaLength + motifLength;
      
      // Only add secondary spikes to ticks (not 0)
      if (pos1 > 0) ticks.push(pos1);
      ticks.push(pos2);
      
      text += ` La séquence "${motif}" est la plus probable de faire des glissements/bégaiements puisque elle se répète dans "${repeat.pattern}", d'où les pics mineurs à ${pos1 > 0 ? `${pos1} et ` : ''}${pos2} pb.`;
    } else {
      text += " Aucun motif répété significatif n'a été trouvé pour générer des pics de glissement.";
    }
    
    // Don't add 0, only show the spike positions
    const sortedTicks = [...new Set(ticks)].sort((a,b) => a - b);
    return { chartTicks: sortedTicks, justificationText: text };

  }, [cleanedDNA, repeatAnalysis]);

  // Generate capillary electrophoresis data
  const electrophoresisData = useMemo(() => {
    if (!cleanedDNA) return [];
    
    const dnaLength = cleanedDNA.length;
    const repeats = repeatAnalysis;
    
    let motifLength = 0;
    if(repeats && repeats.length > 0) {
      motifLength = findMotifLength(repeats[0].pattern);
    }
    
    const data: ElectrophoresisPoint[] = [];
    
    // Calculate zoom range around main and secondary spikes
    const zoomPadding = Math.max(15, motifLength * 2);
    const minX = Math.max(0, dnaLength - motifLength - zoomPadding);
    const maxX = dnaLength + motifLength + zoomPadding;

    // Generate very smooth background noise with 1-bp resolution for higher precision
    for (let i = minX; i <= maxX; i += 1) {
      const baseNoise = 15 + Math.sin(i * 0.1) * 5 + Math.random() * 10;
      data.push({
        size: i,
        intensity: Math.max(5, baseNoise),
        isProtein: false,
        isSecondary: false
      });
    }
    
    // Dynamically set main peak width based on motif length so secondary peaks are visually distinct
    let mainPeakWidth = 6;
    if (motifLength > 0) {
      mainPeakWidth = Math.max(2, Math.min(6, motifLength - 1));
    }
    const maxIntensity = 1000;
    
    for (let i = dnaLength - mainPeakWidth; i <= dnaLength + mainPeakWidth; i++) {
      if (i >= 0 && i <= maxX) {
        const distance = Math.abs(i - dnaLength);
        const intensity = maxIntensity * Math.exp(-(distance * distance) / (2 * (mainPeakWidth/4) * (mainPeakWidth/4)));
        const existingPoint = data.find(d => d.size === i);
        if (existingPoint) {
          existingPoint.intensity += intensity;
          existingPoint.isProtein = distance <= 2;
        } else {
             data.push({ size: i, intensity, isProtein: distance <= 2, isSecondary: false });
        }
      }
    }
    
    // Two small secondary spikes at ± length of the motif (more prominent & sharper)
    if (motifLength > 2) {
      const secondaryIntensity = maxIntensity * 0.15; // Stronger for easy visualization
      const secondaryWidth = Math.max(2, Math.floor(mainPeakWidth / 2)); // keep them sharper
      
      for (let offset of [-motifLength, motifLength]) {
        const secondaryPos = dnaLength + offset;
        
        if (secondaryPos > 0 && secondaryPos <= maxX) {
          for (let i = secondaryPos - secondaryWidth; i <= secondaryPos + secondaryWidth; i++) {
            if (i >= 0 && i <= maxX) {
              const distance = Math.abs(i - secondaryPos);
              const intensity = secondaryIntensity * Math.exp(-(distance * distance) / (2 * (secondaryWidth/3) * (secondaryWidth/3)));
              const existingPoint = data.find(d => d.size === i);
              if (existingPoint) {
                existingPoint.intensity += intensity;
                existingPoint.isSecondary = distance <= 1;
              } else {
                 data.push({  size: i, intensity, isProtein: false, isSecondary: distance <= 1 });
              }
            }
          }
        }
      }
    }
    
    // Smooth the data using a simple moving average
    const sortedData = data.sort((a,b)=>a.size - b.size);
    const smoothedData = sortedData.map((point, index, arr) => {
      const window = 1; // less smoothing to preserve distinct peaks
      const start = Math.max(0, index - window);
      const end = Math.min(arr.length - 1, index + window);
      
      let sum = 0;
      let count = 0;
      for (let i = start; i <= end; i++) {
        sum += arr[i].intensity;
        count++;
      }
      
      return { ...point, intensity: sum / count };
    });
    
    return smoothedData;
  }, [cleanedDNA, repeatAnalysis]);

  const chartConfig = {
    intensity: {
      label: "Intensité",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const handleExampleLoad = () => {
    setRawSequence(exampleSequence);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Traduction Protéique
          </CardTitle>
          <CardDescription>
            Analysez la séquence codante pour déterminer la taille de la protéine en acides aminés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DNAInput
            value={rawSequence}
            onChange={setRawSequence}
            label="Séquence ADN codante (5' → 3')"
            placeholder="Entrez votre séquence ADN... (Ex: ATGGTGGAACTCCAAATTGAAC...)"
            id="sequence"
            rows={4}
            showGrouping={true}
            showValidation={true}
            showStatistics={true}
          />

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExampleLoad}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Charger l'exemple
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Capillary Electrophoresis Chart */}
      {cleanedDNA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Approximation d'Électrophorèse
            </CardTitle>
            <CardDescription>
              Profil de migration de la séquence ADN ({cleanedDNA.length} paires de bases)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={electrophoresisData}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="size"
                  type="number"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  ticks={chartTicks}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  label={{ value: 'Taille (paires de bases)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  label={{ value: 'Intensité', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    indicator="line"
                    formatter={(value) => [`${(value as number).toFixed(0)} unités`, "Intensité"]}
                    labelFormatter={(label) => `${label} pb`}
                  />}
                />
                <Area
                  dataKey="intensity"
                  type="monotone"
                  fill="var(--color-intensity)"
                  fillOpacity={0.4}
                  stroke="var(--color-intensity)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Pic principal à {cleanedDNA.length} paires de bases <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  Simulation basée sur la longueur de l'ADN et les motifs répétés
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Justification Section */}
      {cleanedDNA && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Justification de l'approximation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 p-4 rounded border border-amber-200 text-sm text-amber-900">
              <p>{justificationText}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {rawSequence && !cleanedDNA && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Séquence invalide.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 