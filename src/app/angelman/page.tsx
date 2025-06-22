"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Microscope,
  Dna,
  CheckCircle2,
  AlertCircle,
  FileText,
  Brain
} from 'lucide-react';

const diagnosticTable = [
  {
    mechanism: "1. Délétion maternelle",
    southern: "0,9 kb fine (paternel) – absence de 4,2 kb",
    microsatCritical: "1 pic paternel",
    microsatNonCritical: "2 pics (1 pat. + 1 mat.)",
    conclusion: "Perte locale de l'allèle maternel"
  },
  {
    mechanism: "2. UDP paternelle",
    southern: "0,9 kb large (2 copies) – absence de 4,2 kb",
    microsatCritical: "1 ou 2 pics paternels",
    microsatNonCritical: "1 ou 2 pic paternel",
    conclusion: "Deux allèles paternels (UDP)"
  },
  {
    mechanism: "3. Défaut d'empreinte",
    southern: "0,9 kb large (2 copies non méthylées) – absence de 4,2 kb",
    microsatCritical: "2 pics biparentaux",
    microsatNonCritical: "2 pics biparentaux",
    conclusion: "Empreintes OK → défaut d'imprinting"
  },
  {
    mechanism: "4. Mutation ponctuelle UBE3A",
    southern: "4,2 kb fine (maternel) + 0,9 kb fine (paternel)",
    microsatCritical: "2 pics biparentaux",
    microsatNonCritical: "2 pics biparentaux",
    conclusion: "Séquençage UBE3A (dernier recours)"
  }
];

export default function AngelmanPage() {
  const [southernBlot, setSouthernBlot] = useState('');
  const [microsatCritical, setMicrosatCritical] = useState('');
  const [microsatNonCritical, setMicrosatNonCritical] = useState('');
  const [diagnosis, setDiagnosis] = useState<typeof diagnosticTable[0] | null>(null);

  // Auto-analyze when inputs change
  useEffect(() => {
    if (!southernBlot || !microsatCritical || !microsatNonCritical) {
      setDiagnosis(null);
      return;
    }

    // Create mapping between select values and table values
    const southernMapping: Record<string, string> = {
      "0.9kb fine absence 4.2kb": "0,9 kb fine (paternel) – absence de 4,2 kb",
      "0.9kb large absence 4.2kb": "0,9 kb large (2 copies) – absence de 4,2 kb", 
      "0.9kb large non methylated absence 4.2kb": "0,9 kb large (2 copies non méthylées) – absence de 4,2 kb",
      "4.2kb fine 0.9kb fine": "4,2 kb fine (maternel) + 0,9 kb fine (paternel)"
    };

    const criticalMapping: Record<string, string> = {
      "1 pic paternel": "1 pic paternel",
      "1 ou 2 pics paternels": "1 ou 2 pics paternels", 
      "2 pics biparentaux": "2 pics biparentaux"
    };

    const nonCriticalMapping: Record<string, string> = {
      "2 pics 1 pat 1 mat": "2 pics (1 pat. + 1 mat.)",
      "1 ou 2 pic paternel": "1 ou 2 pic paternel",
      "2 pics biparentaux": "2 pics biparentaux"
    };

    // Find exact matching diagnosis
    const match = diagnosticTable.find(row => {
      const southernMatch = row.southern === southernMapping[southernBlot];
      const criticalMatch = row.microsatCritical === criticalMapping[microsatCritical];
      const nonCriticalMatch = row.microsatNonCritical === nonCriticalMapping[microsatNonCritical];
      
      return southernMatch && criticalMatch && nonCriticalMatch;
    });

    setDiagnosis(match || null);
  }, [southernBlot, microsatCritical, microsatNonCritical]);

  const reset = () => {
    setSouthernBlot('');
    setMicrosatCritical('');
    setMicrosatNonCritical('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Syndrome d'Angelman - Diagnostic Moléculaire</h1>
          <p className="text-lg text-gray-600 mt-2">Analyse des profils Southern blot et microsatellites</p>
          <Badge variant="secondary" className="mt-3">
            Mécanismes épigénétiques
          </Badge>
        </div>
      </div>

      {/* Diagnostic Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Table de Diagnostic - Syndrome d'Angelman
          </CardTitle>
          <CardDescription>
            Corrélation entre les observations moléculaires et les mécanismes pathogéniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left font-semibold">Mécanisme</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Southern (Xba I / Not I)</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Microsat région critique</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Microsat hors région critique</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Conclusion</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticTable.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium text-blue-700">
                      {row.mechanism}
                    </td>
                    <td className="border border-gray-300 p-3 font-mono text-sm">
                      {row.southern}
                    </td>
                    <td className="border border-gray-300 p-3 font-medium text-green-700">
                      {row.microsatCritical}
                    </td>
                    <td className="border border-gray-300 p-3 font-medium text-orange-700">
                      {row.microsatNonCritical}
                    </td>
                    <td className="border border-gray-300 p-3 text-purple-700">
                      {row.conclusion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Diagnostic Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            Outil de Diagnostic Interactif
          </CardTitle>
          <CardDescription>
            Saisissez vos observations pour identifier le mécanisme probable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="southern">Southern Blot (Xba I / Not I)</Label>
              <Select value={southernBlot} onValueChange={setSouthernBlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le profil Southern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.9kb fine absence 4.2kb">0,9 kb fine - absence de 4,2 kb</SelectItem>
                  <SelectItem value="0.9kb large absence 4.2kb">0,9 kb large (2 copies) - absence de 4,2 kb</SelectItem>
                  <SelectItem value="0.9kb large non methylated absence 4.2kb">0,9 kb large (non méthylées) - absence de 4,2 kb</SelectItem>
                  <SelectItem value="4.2kb fine 0.9kb fine">4,2 kb fine + 0,9 kb fine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="microsat-critical">Microsatellites région critique</Label>
              <Select value={microsatCritical} onValueChange={setMicrosatCritical}>
                <SelectTrigger>
                  <SelectValue placeholder="Observations région critique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 pic paternel">1 pic paternel</SelectItem>
                  <SelectItem value="1 ou 2 pics paternels">1 ou 2 pics paternels</SelectItem>
                  <SelectItem value="2 pics biparentaux">2 pics biparentaux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="microsat-non-critical">Microsatellites hors région critique</Label>
              <Select value={microsatNonCritical} onValueChange={setMicrosatNonCritical}>
                <SelectTrigger>
                  <SelectValue placeholder="Observations hors région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 pics 1 pat 1 mat">2 pics (1 pat. + 1 mat.)</SelectItem>
                  <SelectItem value="1 ou 2 pic paternel">1 ou 2 pic paternel</SelectItem>
                  <SelectItem value="2 pics biparentaux">2 pics biparentaux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>

          {diagnosis && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <strong className="text-green-800">Diagnostic probable :</strong>
                    <div className="text-lg font-semibold text-green-700 mt-1">
                      {diagnosis.mechanism}
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-green-800">Justification :</strong>
                    <div className="text-green-700 mt-1">
                      {diagnosis.conclusion}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-3 bg-white rounded border">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Southern Blot</p>
                      <p className="text-sm text-gray-800 font-mono">{diagnosis.southern}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Région critique</p>
                      <p className="text-sm text-gray-800">{diagnosis.microsatCritical}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Hors région critique</p>
                      <p className="text-sm text-gray-800">{diagnosis.microsatNonCritical}</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!diagnosis && southernBlot && microsatCritical && microsatNonCritical && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucune correspondance exacte trouvée. Vérifiez vos sélections ou consultez la table de référence.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

     
    </div>
  );
} 