import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Target, Dna, Scissors, BarChart3, Link } from 'lucide-react';

interface ORFDetails {
  protein: string;
  startPos: number | null;
  stopCodon: string;
  stopPos?: number | null;
}

interface GenomeAnalysis {
  genomeSize: number;
  restrictionSite: string;
  expectedFragments: number;
  analysisSequence?: string;
  expectedOccurrences: number;
  minPrimerLength: number;
  recommendedPrimerLength: number;
}

interface AnalysisResultsProps {
  cleanedDNA: string | null;
  orfDetails: ORFDetails | null;
  genomeAnalysis: GenomeAnalysis | null;
  restrictionSite: string;
  analysisSequence: string;
}

export default function AnalysisResults({
  cleanedDNA,
  orfDetails,
  genomeAnalysis,
  restrictionSite,
  analysisSequence
}: AnalysisResultsProps) {
  if (!cleanedDNA && !genomeAnalysis) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Résultats d'Analyse
        </CardTitle>
        <CardDescription>
          Analyse protéique et calculs génomiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Protein Analysis - Always shown when DNA present */}
          {cleanedDNA && (
            <>
              <div className="bg-blue-50 p-3 rounded border text-center">
                <Dna className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">
                  {cleanedDNA.length}
                </div>
                <p className="text-xs text-gray-600">Paires de bases</p>
              </div>

              <div className="bg-green-50 p-3 rounded border text-center">
                <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">
                  {orfDetails?.protein.length || Math.floor(cleanedDNA.length / 3)}
                </div>
                <p className="text-xs text-gray-600">Acides aminés</p>
              </div>
            </>
          )}

          {/* Genomic Analysis - Conditionally shown */}
          {genomeAnalysis && restrictionSite && (
            <div className="bg-orange-50 p-3 rounded border text-center">
              <Scissors className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-600">
                {genomeAnalysis.expectedFragments.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">Fragments {genomeAnalysis.restrictionSite}</p>
            </div>
          )}

          {genomeAnalysis && analysisSequence && (
            <div className="bg-purple-50 p-3 rounded border text-center">
              <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">
                {Math.ceil(genomeAnalysis.expectedOccurrences)}
              </div>
              <p className="text-xs text-gray-600">Occurrences ({genomeAnalysis.analysisSequence?.length || 0} nt)</p>
            </div>
          )}

          {genomeAnalysis && (
            <div className="bg-red-50 p-3 rounded border text-center">
              <Link className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-600">
                {genomeAnalysis.recommendedPrimerLength}
              </div>
              <p className="text-xs text-gray-600">Amorces optimales</p>
            </div>
          )}
        </div>

        {/* Protein Details */}
        {orfDetails && orfDetails.startPos && cleanedDNA && (
          <>
            <Separator />
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Codon start:</strong> ATG (position {orfDetails.startPos})</p>
              <p><strong>Codon stop:</strong> {orfDetails.stopCodon} {orfDetails.stopPos ? `(position ${orfDetails.stopPos})` : ''}</p>
              <p><strong>Justification:</strong> Séquence de {cleanedDNA.length} pb → {orfDetails.protein.length} acides aminés (division par 3, excluant stop)</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 