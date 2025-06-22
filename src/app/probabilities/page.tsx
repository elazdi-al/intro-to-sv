"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator,
  FileText,
  Users,
  BarChart3
} from 'lucide-react';

import ProbabilityCalculatorTool from '@/components/tools/ProbabilityCalculatorTool';

export default function ProbabilitiesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-orange-100 rounded-full">
            <Calculator className="h-10 w-10 text-orange-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calculateur de Probabilités Génétiques</h1>
          <p className="text-lg text-gray-600 mt-2">Analyse de profils ADN familiaux et correspondances</p>
          <Badge variant="secondary" className="mt-3">
            Génétique familiale
          </Badge>
        </div>
      </div>

      {/* Probability Calculator Tool */}
      <ProbabilityCalculatorTool />

    
    </div>
  );
} 