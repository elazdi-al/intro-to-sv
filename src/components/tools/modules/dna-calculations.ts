export interface ElectrophoresisPoint {
  size: number;
  intensity: number;
  isProtein: boolean;
  isSecondary: boolean;
}

export interface RepeatPattern {
  pattern: string;
  length: number;
  count: number;
  aminoAcids: number;
  totalLength: number;
  start: number;
}

// Calculate expected restriction fragments
export const calculateRestrictionFragments = (genomeSize: number, recognitionSite: string): number => {
  const siteLength = recognitionSite.length;
  const probability = Math.pow(0.25, siteLength);
  return Math.round(genomeSize * probability);
};

// Calculate sequence occurrence probability
export const calculateSequenceOccurrence = (genomeSize: number, sequenceLength: number): number => {
  const probability = Math.pow(0.25, sequenceLength);
  return genomeSize * probability;
};

// Calculate minimum primer length needed for unique amplification
export const calculateMinPrimerLength = (genomeSize: number): number => {
  let length = 1;
  while (Math.pow(4, length) < genomeSize) {
    length++;
  }
  return length;
};

// Suffix array based repeat finder
export const findRepeatsWithSuffixArray = (seq: string): RepeatPattern[] => {
  const n = seq.length;
  if (n < 2) return [];

  const suffixes = Array.from({ length: n }, (_, i) => ({
    index: i,
    suffix: seq.substring(i),
  }));

  suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix));

  const lcpArray = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const s1 = suffixes[i - 1].suffix;
    const s2 = suffixes[i].suffix;
    let j = 0;
    while (j < s1.length && j < s2.length && s1[j] === s2[j]) {
      j++;
    }
    lcpArray[i] = j;
  }

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
export const findMotifLength = (pattern: string): number => {
  if (pattern.length <= 2) return pattern.length;
  
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

// Generate electrophoresis data
export const generateElectrophoresisData = (
  cleanedDNA: string,
  repeatAnalysis: RepeatPattern[] | null
): ElectrophoresisPoint[] => {
  if (!cleanedDNA) return [];
  
  const dnaLength = cleanedDNA.length;
  const repeats = repeatAnalysis;
  
  let motifLength = 0;
  if(repeats && repeats.length > 0) {
    motifLength = findMotifLength(repeats[0].pattern);
  }
  
  const data: ElectrophoresisPoint[] = [];
  
  const zoomPadding = Math.max(15, motifLength * 2);
  const minX = Math.max(0, dnaLength - motifLength - zoomPadding);
  const maxX = dnaLength + motifLength + zoomPadding;

  for (let i = minX; i <= maxX; i += 1) {
    const baseNoise = 15 + Math.sin(i * 0.1) * 5 + Math.random() * 10;
    data.push({
      size: i,
      intensity: Math.max(5, baseNoise),
      isProtein: false,
      isSecondary: false
    });
  }
  
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
  
  if (motifLength > 2) {
    const secondaryIntensity = maxIntensity * 0.15;
    const secondaryWidth = Math.max(2, Math.floor(mainPeakWidth / 2));
    
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
  
  const sortedData = data.sort((a,b)=>a.size - b.size);
  const smoothedData = sortedData.map((point, index, arr) => {
    const window = 1;
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
};

// Generate chart ticks and justification text
export const generateChartAnalysis = (
  cleanedDNA: string,
  repeatAnalysis: RepeatPattern[] | null
): { chartTicks: number[]; justificationText: string } => {
  if (!cleanedDNA) return { chartTicks: [], justificationText: '' };

  const dnaLength = cleanedDNA.length;
  let ticks = [dnaLength];
  let text = `Il y a ${dnaLength} paires de bases, d'où un pic de fluorescence élevé à ${dnaLength} pb.`;

  if (repeatAnalysis && repeatAnalysis.length > 0) {
    const repeat = repeatAnalysis[0];
    const motifLength = findMotifLength(repeat.pattern);
    const motif = repeat.pattern.substring(0, motifLength);
    const pos1 = dnaLength - motifLength;
    const pos2 = dnaLength + motifLength;
    
    if (pos1 > 0) ticks.push(pos1);
    ticks.push(pos2);
    
    text += ` La séquence "${repeat.pattern}" est la plus probable de faire des glissements/bégaiements, d'où les pics mineurs à ${pos1 > 0 ? `${pos1} et ` : ''}${pos2} pb dû aux bégaiements.`;
  } else {
    text += " Aucun motif répété significatif n'a été trouvé pour générer des pics de glissement.";
  }
  
  const sortedTicks = [...new Set(ticks)].sort((a,b) => a - b);
  return { chartTicks: sortedTicks, justificationText: text };
}; 