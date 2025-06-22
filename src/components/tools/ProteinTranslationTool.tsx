"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertCircle
} from 'lucide-react';
import { 
  cleanDNA, 
  findORFDetails, 
  getCodonBreakdown,
 
} from '@/lib/dna-utils';

export default function ProteinTranslationTool() {
  const [rawSequence, setRawSequence] = useState('');

  // Exemple par défaut
  const exampleSequence = "ATGGTGGAACTCCAAATTGAACGTGCAGCCCCGAAAGTGCATCTGGAATGA";

  const cleanedDNA = useMemo(() => cleanDNA(rawSequence), [rawSequence]);
  const orfDetails = useMemo(() => 
    cleanedDNA ? findORFDetails(cleanedDNA) : null, 
    [cleanedDNA]
  );
  const codonBreakdown = useMemo(() => 
    orfDetails?.startPos ? getCodonBreakdown(cleanedDNA, orfDetails.startPos) : [],
    [cleanedDNA, orfDetails?.startPos]
  );

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

      {orfDetails && cleanedDNA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Résultats de l'analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Résumé principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {orfDetails.protein.length}
                  </div>
                  <p className="text-sm text-blue-800 font-medium">
                    Acides aminés
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {orfDetails.startPos || 'N/A'}
                  </div>
                  <p className="text-sm text-green-800 font-medium">
                    Position start (ATG)
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-lg font-bold text-purple-600">
                    {orfDetails.stopCodon}
                  </div>
                  <p className="text-sm text-purple-800 font-medium">
                    Codon stop
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Détails de la séquence */}
            <div className="space-y-4">
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">   
                  <BarChart3 className="h-5 w-5" />
                  Informations détaillées
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Séquence protéique:</strong></p>
                    <div className="font-mono text-sm bg-gray-100 p-3 rounded border">
                      {orfDetails.protein || "Aucune protéine trouvée"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p><strong>Statistiques:</strong></p>
                    <div className="space-y-1 text-sm">
                      <p>• Longueur ADN: {cleanedDNA.length} nucleotides</p>
                   
                      <p>• Position codon start: {orfDetails.startPos || 'Non trouvé'}</p>
                      <p>• Position codon stop: {orfDetails.stopPos || 'Non trouvé'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détail codon par codon */}
              {codonBreakdown.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Dna className="h-5 w-5" />
                    Analyse codon par codon
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {codonBreakdown.map((codon, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded border text-sm ${
                          codon.aminoAcid === '*' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono">{codon.codon}</span>
                          <Badge variant={codon.aminoAcid === '*' ? 'destructive' : 'secondary'}>
                            {codon.aminoAcid}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div>{codon.fullName}</div>
                          <div>Pos: {codon.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message d'aide */}
            <Alert className="mt-6">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Pour répondre aux questions d'examen:</strong>
                <br />
                La taille de la protéine est de <strong>{orfDetails.protein.length} acides aminés</strong>.
                {orfDetails.startPos && orfDetails.stopPos && (
                  <>
                    <br />
                    Le cadre de lecture commence à la position {orfDetails.startPos} (codon ATG) 
                    et se termine à la position {orfDetails.stopPos} (codon {orfDetails.stopCodon}).
                  </>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {rawSequence && !orfDetails?.protein && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucun cadre de lecture ouvert (ORF) trouvé. Vérifiez que votre séquence contient un codon start ATG.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 