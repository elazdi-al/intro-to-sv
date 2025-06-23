import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface GenomeAnalysis {
  genomeSize: number;
  restrictionSite: string;
  expectedFragments: number;
  analysisSequence?: string;
  expectedOccurrences: number;
  minPrimerLength: number;
  recommendedPrimerLength: number;
}

interface DetailedCalculationsProps {
  genomeAnalysis: GenomeAnalysis;
  restrictionSite: string;
  analysisSequence: string;
  cleanedDNA?: string;
}

export default function DetailedCalculations({
  genomeAnalysis,
  restrictionSite,
  analysisSequence,
  cleanedDNA
}: DetailedCalculationsProps) {
  
  // Helper function to format large numbers with exponential notation
  const formatExponential = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)} × 10¹²`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)} × 10⁹`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)} × 10⁶`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)} × 10³`;
    return num.toLocaleString();
  };

  // Helper function to get exponential representation of powers of 4
  const getPowerOf4Exponential = (power: number): string => {
    const result = Math.pow(4, power);
    return formatExponential(result);
  };

  // Detect silent mutations dynamically based on codon structure
  const getSilentMutationPositions = (dnaSequence?: string): number[] => {
    if (!dnaSequence) return [];
    const positions: number[] = [];
    
    // Find positions that are multiples of 3 (3rd position in each codon - wobble positions)
    // Using 1-based indexing where position 3, 6, 9, etc. are wobble positions
    for (let i = 3; i <= dnaSequence.length; i += 3) {
      positions.push(i);
    }
    return positions.slice(0, 3); // Show first 3 wobble positions as examples
  };

  const silentPositions = getSilentMutationPositions(cleanedDNA);
  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-4 w-4 text-amber-600" />
          Détails des Calculs et Résolution d'Inégalités
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-amber-50 p-4 rounded border border-amber-200 text-sm text-amber-900 space-y-3">

          {restrictionSite && (
            <div>
              <p><strong>1.8 Fragments de restriction:</strong></p>
              <p className="ml-4">Probabilité = (1/4)^{genomeAnalysis.restrictionSite.length} = 1/4^{genomeAnalysis.restrictionSite.length}</p>
              <p className="ml-4">= 1/{getPowerOf4Exponential(genomeAnalysis.restrictionSite.length)} ≈ {(1/Math.pow(4, genomeAnalysis.restrictionSite.length)).toExponential(2)}</p>
              <p className="ml-4">Fragments attendus = {formatExponential(genomeAnalysis.genomeSize)} × {(1/Math.pow(4, genomeAnalysis.restrictionSite.length)).toExponential(2)} ≈ {genomeAnalysis.expectedFragments.toFixed(2)}</p>
            </div>
          )}
          
          {analysisSequence && (
            <div>
              <p><strong>1.9 Occurrences de séquence:</strong></p>
              <p className="ml-4">Occurrences = Taille_génome / 4^longueur_séquence</p>
              <p className="ml-4">= {formatExponential(genomeAnalysis.genomeSize)} / 4^{genomeAnalysis.analysisSequence?.length || 0}</p>
              <p className="ml-4">= {formatExponential(genomeAnalysis.genomeSize)} / {getPowerOf4Exponential(genomeAnalysis.analysisSequence?.length || 0)}</p>
              <p className="ml-4">≈ {genomeAnalysis.expectedOccurrences < 0.01 ? genomeAnalysis.expectedOccurrences.toExponential(2) : genomeAnalysis.expectedOccurrences.toFixed(2)} occurrences</p>
              <p className="ml-4"><strong>⟹ {Math.ceil(genomeAnalysis.expectedOccurrences)} occurrence{Math.ceil(genomeAnalysis.expectedOccurrences) > 1 ? 's' : ''} attendue{Math.ceil(genomeAnalysis.expectedOccurrences) > 1 ? 's' : ''}</strong></p>
            </div>
          )}
          
          <div>
            <p><strong>1.10 Résolution de l'inégalité pour taille minimale d'amorces:</strong></p>
            <p className="ml-4">Condition: 4^n ≥ {formatExponential(genomeAnalysis.genomeSize)} (pour amorces uniques)</p>
            <p className="ml-4">Étape 1: ln(4^n) ≥ ln({formatExponential(genomeAnalysis.genomeSize)})</p>
            <p className="ml-4">Étape 2: n × ln(4) ≥ ln({genomeAnalysis.genomeSize})</p>
            <p className="ml-4">Étape 3: n ≥ ln({genomeAnalysis.genomeSize}) / ln(4)</p>
            <p className="ml-4">Étape 4: n ≥ {(Math.log(genomeAnalysis.genomeSize) / Math.log(4)).toFixed(2)}</p>
            <p className="ml-4">Donc: n_min = {genomeAnalysis.minPrimerLength} nucleotides (arrondi supérieur)</p>
          </div>
          
          <div>
            <p><strong>1.11 Amorces recommandées:</strong></p>
            <p className="ml-4">Longueur pratique = longueur_minimale + marge_sécurité</p>
            <p className="ml-4">= {genomeAnalysis.minPrimerLength} + 2 = {genomeAnalysis.recommendedPrimerLength} nucleotides</p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border">
            <p><strong>Vérification:</strong></p>
            <p className="ml-4 text-xs">4^{genomeAnalysis.minPrimerLength} = {getPowerOf4Exponential(genomeAnalysis.minPrimerLength)} ≥ {formatExponential(genomeAnalysis.genomeSize)} ✓</p>
            <p className="ml-4 text-xs">4^{genomeAnalysis.minPrimerLength - 1} = {getPowerOf4Exponential(genomeAnalysis.minPrimerLength - 1)} &lt; {formatExponential(genomeAnalysis.genomeSize)} (insuffisant)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 