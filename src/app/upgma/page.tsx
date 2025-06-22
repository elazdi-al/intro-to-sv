"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TreePine,
  FileText,
  BarChart3
} from 'lucide-react';

import UPGMATool from '@/components/tools/UPGMATool';

export default function UPGMAPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-emerald-100 rounded-full">
            <TreePine className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UPGMA - Arbres Phylogénétiques</h1>
          <p className="text-lg text-gray-600 mt-2">Unweighted Pair Group Method with Arithmetic Mean</p>
          <Badge variant="secondary" className="mt-3">
            Construction d'arbres phylogénétiques
          </Badge>
        </div>
      </div>

    
      {/* UPGMA Tool */}
      <UPGMATool />

      {/* Method Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            À propos de UPGMA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-emerald-600">Principe de la méthode</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>Clustering hiérarchique:</strong> Regroupe progressivement les espèces les plus proches</li>
                <li>• <strong>Distances moyennes:</strong> Utilise la moyenne arithmétique des distances</li>
                <li>• <strong>Hypothèse d'horloge:</strong> Suppose un taux d'évolution constant</li>
                <li>• <strong>Arbre enraciné:</strong> Produit un dendrogramme avec une racine commune</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-emerald-600">Étapes de l'algorithme</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li><strong>1.</strong> Calculer la matrice de distances entre toutes les espèces</li>
                <li><strong>2.</strong> Identifier la paire avec la distance minimale</li>
                <li><strong>3.</strong> Créer un nouveau cluster avec ces deux espèces</li>
                <li><strong>4.</strong> Recalculer les distances du nouveau cluster</li>
                <li><strong>5.</strong> Répéter jusqu'à ce qu'il ne reste qu'un seul cluster</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-700 mb-2">Formule de recalcul des distances</h4>
            <p className="text-sm text-emerald-600">
              Quand on fusionne les clusters A et B pour former AB, la distance vers un autre cluster C est :
              <br />
              <code className="bg-white px-2 py-1 rounded mt-1 inline-block">
                d(AB,C) = [d(A,C) + d(B,C)] / 2
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 