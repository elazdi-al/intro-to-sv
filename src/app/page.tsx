"use client";

import {
  Dna,
  Info
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Dna className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BIO 105 Solver</h1>
          <p className="text-xl text-gray-600 mt-2">Outil complet pour l'analyse en biologie moléculaire - BIO105</p>
        
        </div>
      </div>

      {/* Mémo BIO105 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Fiches Mémo BIO105
          </CardTitle>
          <CardDescription>Rappels essentiels pour l'examen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Génétique de base */}
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">Génétique de base</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Homme (XY):</strong> 1 chromosome X + 1 chromosome Y</li>
                <li><strong>Femme (XX):</strong> 2 chromosomes X</li>
                <li><strong>Homozygote:</strong> deux allèles identiques pour un gène donné</li>
                <li><strong>Hétérozygote:</strong> deux allèles différents pour un gène donné</li>
                <li><strong>Cis:</strong> deux variants/gènes situés sur <em>le même</em> chromosome homologué</li>
                <li><strong>Trans:</strong> deux variants/gènes situés sur <em>des chromosomes homologues opposés</em></li>
              </ul>
            </div>

            {/* Tailles de génomes & chiffres utiles */}
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">Ordres de grandeur</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>ADN humain:</strong> 3 × 10<sup>9</sup> pb</li>
                <li><strong>ADN E. coli:</strong> 4.6 × 10<sup>6</sup> pb</li>
                <li><strong>Longueur amorce PCR typique:</strong> 14-20 bases (16 bases uniques dans le génome humain)</li>
                <li><strong>Vitesse ADN polymérase III (E. coli):</strong> 1 000 bases/s</li>
                <li><strong>Nbr. fragments d'Okazaki (E. coli):</strong> ≃ 4 600 (fragments de 1 000 pb)</li>
                <li><strong>Copies après 30 cycles PCR:</strong> ≃ 10<sup>9</sup></li>
              </ul>
            </div>
          </div>

          {/* Types de transmission maladies */}
          <div className="pt-4">
            <h3 className="font-semibold text-blue-600 mb-2">Types de transmission (exemples)</h3>
            <table className="w-full text-xs border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-1">Maladie</th>
                  <th className="border px-2 py-1">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1">Daltonisme</td><td className="border px-2 py-1">Liée à X récessive (XLR)</td></tr>
                <tr><td className="border px-2 py-1">Achondroplasie</td><td className="border px-2 py-1">Autosomique dominante (AD)</td></tr>
                <tr><td className="border px-2 py-1">Albinisme</td><td className="border px-2 py-1">Autosomique récessive (AR)</td></tr>
                <tr><td className="border px-2 py-1">Cataracte héréditaire</td><td className="border px-2 py-1">Autosomique récessive (AR)</td></tr>
                <tr><td className="border px-2 py-1">Hypercholestérolémie</td><td className="border px-2 py-1">Autosomique dominante (AD)</td></tr>
                <tr><td className="border px-2 py-1">Cheveux roux</td><td className="border px-2 py-1">Autosomique récessive (AR)</td></tr>
                <tr><td className="border px-2 py-1">Syndrome d'Angelman</td><td className="border px-2 py-1">Empreinte (expression maternelle absente)</td></tr>
                <tr><td className="border px-2 py-1">Syndrome de Prader-Willi</td><td className="border px-2 py-1">Empreinte (expression paternelle absente)</td></tr>
                <tr><td className="border px-2 py-1">SCID (X-linked)</td><td className="border px-2 py-1">Liée à X récessive (XLR)</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
