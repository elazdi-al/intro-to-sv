"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import DNAInput from '@/components/ui/dna-input';
import { 
  Shuffle, 
  BarChart3, 
  FileText, 
  AlertCircle,
  Lightbulb,
  Info,
  Circle,
  CheckCircle2
} from 'lucide-react';
import { 
  cleanDNA, 
  findORFDetails, 
  applyMutation,
  formatMutationDescription 
} from '@/lib/dna-utils';
import { useDNAStore } from '@/store/dna-store';

export default function MutationAnalysisTool() {
  const { dnaSequence, setDnaSequence } = useDNAStore();
  const [mutationType, setMutationType] = useState<'substitution' | 'insertion' | 'deletion'>('substitution');
  const [position, setPosition] = useState('');
  const [newBase, setNewBase] = useState('');

  // Exemple par défaut
  const exampleSequence = "ATGGTGGAACTCCAAATTGAACGTGCAGCCCCGAAAGTGCATCTGGAATGA";

  const cleanedDNA = useMemo(() => cleanDNA(dnaSequence), [dnaSequence]);
  
  // Analyse de la séquence originale
  const originalORF = useMemo(() => 
    cleanedDNA ? findORFDetails(cleanedDNA) : null, 
    [cleanedDNA]
  );

  // Analyse de la séquence mutée
  const mutatedSequence = useMemo(() => {
    if (!cleanedDNA || !position || (mutationType !== 'deletion' && !newBase)) return '';
    const pos = parseInt(position);
    if (isNaN(pos) || pos < 1 || pos > cleanedDNA.length) return '';
    return applyMutation(cleanedDNA, mutationType, pos, newBase);
  }, [cleanedDNA, mutationType, position, newBase]);

  const mutatedORF = useMemo(() => 
    mutatedSequence ? findORFDetails(mutatedSequence) : null,
    [mutatedSequence]
  );

  const mutationDescription = useMemo(() => {
    if (!cleanedDNA || !position) return '';
    const pos = parseInt(position);
    if (isNaN(pos)) return '';
    return formatMutationDescription(mutationType, pos, newBase, cleanedDNA);
  }, [cleanedDNA, mutationType, position, newBase]);

  const handleExampleLoad = () => {
    setDnaSequence(exampleSequence);
    setPosition('42');
    setNewBase('G');
    setMutationType('substitution');
  };

  const quickMutations = [
    { label: 'T→G', type: 'substitution', base: 'G' },
    { label: 'A→T', type: 'substitution', base: 'T' },
    { label: 'C→A', type: 'substitution', base: 'A' },
    { label: 'G→C', type: 'substitution', base: 'C' },
  ];

  const handleQuickMutation = (base: string) => {
    setMutationType('substitution');
    setNewBase(base);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Analyse de Mutations
          </CardTitle>
          <CardDescription>
            Comparez l'effet des mutations sur la traduction protéique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DNAInput
            value={dnaSequence}
            onChange={setDnaSequence}
            label="Séquence ADN originale (5' → 3')"
            placeholder="Entrez votre séquence ADN..."
            id="sequence"
            rows={3}
            showGrouping={true}
            showValidation={false}
            showStatistics={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type de mutation</Label>
              <Select value={mutationType} onValueChange={(value: any) => setMutationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="substitution">Substitution</SelectItem>
                  <SelectItem value="insertion">Insertion</SelectItem>
                  <SelectItem value="deletion">Délétion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position (base 1)</Label>
              <Input
                id="position"
                type="number"
                placeholder="Ex: 42"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                min="1"
                max={cleanedDNA.length || 100}
              />
            </div>

            {mutationType !== 'deletion' && (
              <div className="space-y-2">
                <Label htmlFor="newBase">Nouvelle base</Label>
                <Input
                  id="newBase"
                  placeholder="Ex: G"
                  value={newBase}
                  onChange={(e) => setNewBase(e.target.value.toUpperCase())}
                  maxLength={1}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExampleLoad}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Charger l'exemple
            </Button>
            
            {mutationType === 'substitution' && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <span className="text-sm text-gray-600 self-center">Mutations rapides:</span>
                {quickMutations.map((mut) => (
                  <Button
                    key={mut.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMutation(mut.base)}
                    className="text-xs"
                  >
                    {mut.label}
                  </Button>
                ))}
              </>
            )}
          </div>


        </CardContent>
      </Card>

      {/* Comparaison avant/après */}
      {originalORF && mutatedORF && mutationDescription && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Séquence originale */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                <Circle className="h-5 w-5 fill-current" />
                Séquence Originale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {originalORF.protein.length}
                  </div>
                  <p className="text-sm text-blue-800">Acides aminés</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {originalORF.stopCodon}
                  </div>
                  <p className="text-sm text-blue-800">Codon stop</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Séquence protéique:</p>
                <div className="font-mono text-xs bg-blue-50 p-2 rounded border">
                  {originalORF.protein || "Aucune protéine"}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p>Position start: {originalORF.startPos}</p>
                <p>Position stop: {originalORF.stopPos}</p>
              </div>
            </CardContent>
          </Card>

          {/* Séquence mutée */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Séquence Mutée
              </CardTitle>
              <CardDescription>
                <Badge variant="outline" className="text-xs">
                  {mutationDescription}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {mutatedORF.protein.length}
                  </div>
                  <p className="text-sm text-green-800">Acides aminés</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {mutatedORF.stopCodon}
                  </div>
                  <p className="text-sm text-green-800">Codon stop</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Séquence protéique:</p>
                <div className="font-mono text-xs bg-green-50 p-2 rounded border">
                  {mutatedORF.protein || "Aucune protéine"}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <p>Position start: {mutatedORF.startPos}</p>
                <p>Position stop: {mutatedORF.stopPos}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Résumé des changements */}
      {originalORF && mutatedORF && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyse des changements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {mutatedORF.protein.length - originalORF.protein.length > 0 ? '+' : ''}
                      {mutatedORF.protein.length - originalORF.protein.length}
                    </div>
                    <p className="text-sm text-gray-600">Changement en AA</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {mutationDescription}
                    </div>
                    <p className="text-sm text-gray-600">Mutation appliquée</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {originalORF.stopCodon === mutatedORF.stopCodon ? '=' : '≠'}
                    </div>
                    <p className="text-sm text-gray-600">Codon stop</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Pour répondre aux questions d'examen:</strong>
                <br />
                Séquence originale: <strong>{originalORF.protein.length} acides aminés</strong>
                <br />
                Après mutation ({mutationDescription}): <strong>{mutatedORF.protein.length} acides aminés</strong>
                <br />
                Différence: <strong>{mutatedORF.protein.length - originalORF.protein.length > 0 ? '+' : ''}{mutatedORF.protein.length - originalORF.protein.length} acides aminés</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Messages d'erreur */}
      {dnaSequence && !originalORF?.protein && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucun cadre de lecture ouvert trouvé dans la séquence originale. Vérifiez la présence du codon ATG.
          </AlertDescription>
        </Alert>
      )}

      {position && cleanedDNA && (parseInt(position) < 1 || parseInt(position) > cleanedDNA.length) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Position invalide. La position doit être entre 1 et {cleanedDNA.length}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 