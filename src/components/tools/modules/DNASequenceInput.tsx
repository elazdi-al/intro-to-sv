import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DNAInput from '@/components/ui/dna-input';
import { Dna, FileText } from 'lucide-react';
import { useDNAStore } from '@/store/dna-store';

interface DNASequenceInputProps {
  onExampleLoad: () => void;
}

export default function DNASequenceInput({ 
  onExampleLoad 
}: DNASequenceInputProps) {
  const { dnaSequence, setDnaSequence } = useDNAStore();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dna className="h-5 w-5" />
          Analyse ADN complète (PCR + Génomique)
        </CardTitle>
        <CardDescription>
          Entrez votre séquence ADN pour analyser protéines, amorces PCR et propriétés génomiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DNAInput
          value={dnaSequence}
          onChange={setDnaSequence}
          label="séquence ADN (5' → 3')"
          placeholder="Entrez votre séquence ADN..."
          id="sequence"
          rows={4}
          showGrouping={true}
          showValidation={true}
          showStatistics={true}
        />

        <Button 
          variant="outline" 
          size="sm"
          onClick={onExampleLoad}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Charger l'exemple complet
        </Button>
      </CardContent>
    </Card>
  );
} 