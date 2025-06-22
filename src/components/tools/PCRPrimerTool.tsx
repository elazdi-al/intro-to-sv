"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import DNAInput from '@/components/ui/dna-input';
import { 
  Link, 
  ArrowRight, 
  ArrowLeft, 
  Microscope, 
  FileText, 
  Trash2, 
  Lightbulb,
  AlertCircle,
  Info,
  Thermometer,
  Clock
} from 'lucide-react';
import { 
  cleanDNA,     
  designPCRPrimers,

  reverseComplement 
} from '@/lib/dna-utils';

export default function PCRPrimerTool() {
  const [rawSequence, setRawSequence] = useState('');
  const [primerLength, setPrimerLength] = useState('14');

  // Exemple par défaut 
  const exampleSequence = "ATGGTGGAACTCCAAATTGAACGTGCAGCCCCGAAAGTGCATCTGGAATGAACCGTCAGGACATGCGTCTGAAATGGCAGCAGTAG";

  const cleanedDNA = useMemo(() => cleanDNA(rawSequence), [rawSequence]);
  
  const primers = useMemo(() => {
    if (!cleanedDNA || !primerLength) return null;
    const length = parseInt(primerLength);
    if (isNaN(length) || length < 8 || length > 30) return null;
    return designPCRPrimers(cleanedDNA, length);
  }, [cleanedDNA, primerLength]);

  const primerAnalysis = useMemo(() => {
    if (!primers) return null;
    
    return {
      forward: {
        sequence: primers.forward,

        length: primers.forward.length
      },
      reverse: {
        sequence: primers.reverse,

        length: primers.reverse.length
      }
    };
  }, [primers]);

  const handleExampleLoad = () => {
    setRawSequence(exampleSequence);
    setPrimerLength('14');
  };

  const amplifiedRegion = useMemo(() => {
    if (!cleanedDNA || !primers) return '';
    // Simplifié : on montre la région entre les amorces
    return cleanedDNA;
  }, [cleanedDNA, primers]);

  const getTmColor = (tm: number) => {
    if (tm >= 50 && tm <= 65) return 'text-green-600';
    if (tm >= 45 && tm < 50) return 'text-yellow-600';
    if (tm > 65 && tm <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGCColor = (gc: number) => {
    if (gc >= 40 && gc <= 60) return 'text-green-600';
    if (gc >= 30 && gc < 40) return 'text-yellow-600';
    if (gc > 60 && gc <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Conception d'Amorces PCR
          </CardTitle>
          <CardDescription>
            Concevez automatiquement des amorces forward et reverse pour l'amplification PCR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DNAInput
            value={rawSequence}
            onChange={setRawSequence}
            label="Séquence cible à amplifier (5' → 3')"
            placeholder="Entrez la séquence à amplifier..."
            id="sequence"
            rows={4}
            showGrouping={true}
            showValidation={false}
            showStatistics={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primerLength">Longueur des amorces</Label>
              <Input
                id="primerLength"
                type="number"
                placeholder="14"
                value={primerLength}
                onChange={(e) => setPrimerLength(e.target.value)}
                min="8"
                max="30"
              />
              <p className="text-xs text-gray-500">Recommandé: 12-20 nucleotides</p>
            </div>

            <div className="space-y-2">
              <Label>Longueur de la séquence</Label>
              <div className="p-2 bg-gray-50 rounded border">
                <span className="text-sm font-medium">{cleanedDNA.length} nucleotides</span>
              </div>
            </div>
          </div>

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

      {primerAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amorce Forward */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Amorce Forward (5' → 3')
              </CardTitle>
              <CardDescription>
                Amorce sens (début de la séquence)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Séquence</Label>
                <div className="font-mono text-sm bg-blue-50 p-3 rounded border break-all">
                  {primerAnalysis.forward.sequence}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {primerAnalysis.forward.length}
                  </div>
                  <p className="text-xs text-gray-600">Nucleotides</p>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Amorce Reverse */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Amorce Reverse (5' → 3')
              </CardTitle>
              <CardDescription>
                Amorce antisens (fin de la séquence, complément inverse)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Séquence</Label>
                <div className="font-mono text-sm bg-green-50 p-3 rounded border break-all">
                  {primerAnalysis.reverse.sequence}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {primerAnalysis.reverse.length}
                  </div>
                  <p className="text-xs text-gray-600">Nucleotides</p>
                </div>
                            </div>
            </CardContent>
          </Card>
        </div>
      )}

   
      {/* Messages d'erreur */}
      {primerLength && (parseInt(primerLength) < 8 || parseInt(primerLength) > 30) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Longueur d'amorce invalide. Utilisez une longueur entre 8 et 30 nucleotides.
          </AlertDescription>
        </Alert>
      )}

      {rawSequence && cleanedDNA.length < 20 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Séquence trop courte pour un design d'amorces efficace. Minimum recommandé: 20 nucleotides.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 