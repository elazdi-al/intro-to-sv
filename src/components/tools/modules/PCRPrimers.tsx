import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Primers {
  forward: string;
  reverse: string;
}

interface PCRPrimersProps {
  primers: Primers;
}

export default function PCRPrimers({ primers }: PCRPrimersProps) {
  return (
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
              {primers.forward}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {primers.forward.length}
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
              {primers.reverse}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {primers.reverse.length}
              </div>
              <p className="text-xs text-gray-600">Nucleotides</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 