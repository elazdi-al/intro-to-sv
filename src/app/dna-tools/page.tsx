"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dna, 
  Shuffle, 
  Link,
  FileText
} from 'lucide-react';

// Import tool components
import ProteinTranslationTool from '@/components/tools/ProteinTranslationTool';
import MutationAnalysisTool from '@/components/tools/MutationAnalysisTool';
import PCRPrimerTool from '@/components/tools/PCRPrimerTool';


export default function DNAToolsPage() {
  const [activeTab, setActiveTab] = useState('translation');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Dna className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outils d'Analyse ADN</h1>
          <p className="text-lg text-gray-600 mt-2">Traduction protéique, mutations et amorces PCR</p>
          <Badge variant="secondary" className="mt-3">
            Séquences 5' → 3'
          </Badge>
        </div>
      </div>



      {/* Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="translation" className="flex items-center gap-2">
            <Dna className="h-4 w-4" />
            <span className="hidden sm:inline">Traduction</span>
          </TabsTrigger>
          <TabsTrigger value="mutations" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Mutations</span>
          </TabsTrigger>
          <TabsTrigger value="pcr" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">PCR</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translation" className="mt-6">
          <ProteinTranslationTool />
        </TabsContent>

        <TabsContent value="mutations" className="mt-6">
          <MutationAnalysisTool />
        </TabsContent>

        <TabsContent value="pcr" className="mt-6">
          <PCRPrimerTool />
        </TabsContent>
      </Tabs>
    </div>
  );
} 