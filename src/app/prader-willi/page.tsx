"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Dna,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

const diagnosticTable = [
  {
    mechanism: "1. Délétion paternelle",
    southern: "4,2 kb fine (maternel) – absence de 0,9 kb",
    microsatCritical: "1 pic maternel",
    microsatNonCritical: "2 pics (1 pat. + 1 mat.)",
    conclusion: "Perte locale de l'allèle paternel"
  },
  {
    mechanism: "2. UDP maternelle",
    southern: "4,2 kb large (2 copies) – absence de 0,9 kb",
    microsatCritical: "1 ou 2 pics maternels",
    microsatNonCritical: "1 ou 2 pics maternels",
    conclusion: "Deux allèles maternels (UDP)"
  },
  {
    mechanism: "3. Défaut d'empreinte",
    southern: "4,2 kb large (2 copies méthylées) – absence de 0,9 kb",
    microsatCritical: "2 pics biparentaux",
    microsatNonCritical: "2 pics biparentaux",
    conclusion: "Empreintes KO → défaut d'imprinting"
  }
];

export default function PraderWilliPage() {
  const [southernBlot, setSouthernBlot] = useState('');
  const [microsatCritical, setMicrosatCritical] = useState('');
  const [microsatNonCritical, setMicrosatNonCritical] = useState('');
  const [diagnosis, setDiagnosis] = useState<typeof diagnosticTable[0] | null>(null);

  // Auto-analyze
  useEffect(() => {
    if (!southernBlot || !microsatCritical || !microsatNonCritical) {
      setDiagnosis(null);
      return;
    }

    const southernMapping: Record<string, string> = {
      "4.2kb fine absence 0.9kb": "4,2 kb fine (maternel) – absence de 0,9 kb",
      "4.2kb large absence 0.9kb": "4,2 kb large (2 copies) – absence de 0,9 kb",
      "4.2kb large methylated absence 0.9kb": "4,2 kb large (2 copies méthylées) – absence de 0,9 kb",
    };

    const criticalMapping: Record<string, string> = {
      "1 pic maternel": "1 pic maternel",
      "1 ou 2 pics maternels": "1 ou 2 pics maternels",
      "2 pics biparentaux": "2 pics biparentaux",
    };

    const nonCriticalMapping: Record<string, string> = {
      "2 pics 1 pat 1 mat": "2 pics (1 pat. + 1 mat.)",
      "1 ou 2 pics maternels": "1 ou 2 pics maternels",
      "2 pics biparentaux": "2 pics biparentaux",
    };

    const match = diagnosticTable.find(row =>
      row.southern === southernMapping[southernBlot] &&
      row.microsatCritical === criticalMapping[microsatCritical] &&
      row.microsatNonCritical === nonCriticalMapping[microsatNonCritical]
    );

    setDiagnosis(match || null);
  }, [southernBlot, microsatCritical, microsatNonCritical]);

  const reset = () => {
    setSouthernBlot('');
    setMicrosatCritical('');
    setMicrosatNonCritical('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-rose-100 rounded-full">
            <Users className="h-10 w-10 text-rose-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Syndrome de Prader-Willi – Diagnostic Moléculaire</h1>
          <p className="text-lg text-gray-600 mt-2">Analyse Southern blot & microsatellites</p>
          <Badge variant="secondary" className="mt-3">Génétique épigénétique</Badge>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Table de Diagnostic – Prader-Willi
          </CardTitle>
          <CardDescription>Correspondance observations ↔ mécanismes pathogéniques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left font-semibold">Mécanisme</th>
                  <th className="border p-2 text-left font-semibold">Southern (Xba I / Not I)</th>
                  <th className="border p-2 text-left font-semibold">Microsat région critique</th>
                  <th className="border p-2 text-left font-semibold">Microsat hors région critique</th>
                  <th className="border p-2 text-left font-semibold">Conclusion</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticTable.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2 text-rose-700 font-medium">{row.mechanism}</td>
                    <td className="border p-2 font-mono">{row.southern}</td>
                    <td className="border p-2 text-green-700">{row.microsatCritical}</td>
                    <td className="border p-2 text-orange-700">{row.microsatNonCritical}</td>
                    <td className="border p-2 text-purple-700">{row.conclusion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Outil de Diagnostic Interactif
          </CardTitle>
          <CardDescription>Sélectionnez vos observations pour obtenir le diagnostic probable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Southern */}
            <div className="space-y-2">
              <Label>Southern Blot (Xba I / Not I)</Label>
              <Select value={southernBlot} onValueChange={setSouthernBlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Profil Southern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.2kb fine absence 0.9kb">4,2 kb fine – absence de 0,9 kb</SelectItem>
                  <SelectItem value="4.2kb large absence 0.9kb">4,2 kb large – absence de 0,9 kb</SelectItem>
                  <SelectItem value="4.2kb large methylated absence 0.9kb">4,2 kb large (méthylées) – absence de 0,9 kb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Critical microsat */}
            <div className="space-y-2">
              <Label>Microsats région critique</Label>
              <Select value={microsatCritical} onValueChange={setMicrosatCritical}>
                <SelectTrigger>
                  <SelectValue placeholder="Observations critiques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 pic maternel">1 pic maternel</SelectItem>
                  <SelectItem value="1 ou 2 pics maternels">1 ou 2 pics maternels</SelectItem>
                  <SelectItem value="2 pics biparentaux">2 pics biparentaux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Non-critical microsat */}
            <div className="space-y-2">
              <Label>Microsats hors région critique</Label>
              <Select value={microsatNonCritical} onValueChange={setMicrosatNonCritical}>
                <SelectTrigger>
                  <SelectValue placeholder="Observations hors région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 pics 1 pat 1 mat">2 pics (1 pat. + 1 mat.)</SelectItem>
                  <SelectItem value="1 ou 2 pics maternels">1 ou 2 pics maternels</SelectItem>
                  <SelectItem value="2 pics biparentaux">2 pics biparentaux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset button */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>

          {/* Result */}
          {diagnosis && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <strong className="text-green-800">Diagnostic probable :</strong>
                    <div className="text-lg font-semibold text-green-700 mt-1">{diagnosis.mechanism}</div>
                  </div>
                  <div>
                    <strong className="text-green-800">Justification :</strong>
                    <div className="text-green-700 mt-1">{diagnosis.conclusion}</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!diagnosis && southernBlot && microsatCritical && microsatNonCritical && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Pas de correspondance exacte, vérifiez vos sélections.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 