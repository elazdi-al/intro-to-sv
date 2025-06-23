import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface GenomicParametersProps {
  genomeSize: string;
  restrictionSite: string;
  analysisSequence: string;
  primerLength: string;
  effectivePrimerLength: string;
  recommendedPrimerLength?: number;
  onGenomeSizeChange: (value: string) => void;
  onRestrictionSiteChange: (value: string) => void;
  onAnalysisSequenceChange: (value: string) => void;
  onPrimerLengthChange: (value: string) => void;
}

export default function GenomicParameters({
  genomeSize,
  restrictionSite,
  analysisSequence,
  primerLength,
  effectivePrimerLength,
  recommendedPrimerLength,
  onGenomeSizeChange,
  onRestrictionSiteChange,
  onAnalysisSequenceChange,
  onPrimerLengthChange
}: GenomicParametersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Paramètres d'Analyse Génomique (Optionnel)
        </CardTitle>
        <CardDescription>
          Ajoutez ces paramètres pour des calculs génomiques avancés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="genomeSize">Taille du génome (pb)</Label>
            <Input
              id="genomeSize"
              type="number"
              placeholder="12000000"
              value={genomeSize}
              onChange={(e) => onGenomeSizeChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">Ex: Levure = 12M pb</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restrictionSite">Site de restriction</Label>
            <Input
              id="restrictionSite"
              placeholder="GAATTC"
              value={restrictionSite}
              onChange={(e) => onRestrictionSiteChange(e.target.value.toUpperCase())}
            />
            <p className="text-xs text-gray-500">Ex: EcoRI = GAATTC</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysisSequence">Séquence à analyser</Label>
            <Input
              id="analysisSequence"
              placeholder="cacccgaaacgacgtcgtaa"
              value={analysisSequence}
              onChange={(e) => onAnalysisSequenceChange(e.target.value.toLowerCase())}
            />
            <p className="text-xs text-gray-500">20 premiers nucleotides</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primerLength">Longueur des amorces</Label>
            <Input
              id="primerLength"
              type="number"
              placeholder={effectivePrimerLength || "Auto"}
              value={primerLength}
              onChange={(e) => onPrimerLengthChange(e.target.value)}
              min="8"
              max="30"
            />
            <p className="text-xs text-gray-500">
              {recommendedPrimerLength ? 
                `Auto: ${recommendedPrimerLength}` : 
                'Auto avec taille génome'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 