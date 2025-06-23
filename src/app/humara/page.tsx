"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dna, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle,
  Info,
  Microscope
} from 'lucide-react';

export default function HUMARAPage() {
  const steps = [
    {
      number: 1,
      title: "Lister les allèles HUMARA de chaque enfant (sans Hpa II)",
      description: "Identifier les profils de répétition pour chaque individu",
      example: [
        "F1 : 12 / 16",
        "F2 : 14 / 16", 
        "S1 : 12",
        "S2 : 14"
      ]
    },
    {
      number: 2,
      title: "Déterminer les allèles maternels",
      description: "Chez un garçon le X vient toujours de la mère",
      example: [
        "S1 a l'allèle 12 → Mère possède 12",
        "S2 a l'allèle 14 → Mère possède 14",
        "→ Mère : 12 et 14"
      ]
    },
    {
      number: 3,
      title: "Déterminer l'allèle paternel",
      description: "Chez une fille : X mère + X père",
      example: [
        "Allèle commun aux deux filles : 16",
        "Allèle absent chez les garçons : 16",
        "→ Père porte l'allèle 16"
      ]
    },
    {
      number: 4,
      title: "Déduire le génotype et l'allèle muté",
      description: "Analyser le phénotype pour déterminer les allèles normaux/mutés",
      example: [
        "Père daltonien ⇒ Xᶜ(16) / Y",
        "Garçons NON daltoniens ⇒ X⁺(12) et X⁺(14)",
        "Mère : X⁺(12) / X⁺(14) (NON porteuse)",
        "Père : Xᶜ(16) / Y"
      ]
    },
    {
      number: 5,
      title: "Vérifier le statut « porteuse » de la mère",
      description: "Analyser la transmission des allèles mutés",
      example: [
        "Aucun garçon n'a l'allèle 16",
        "La mère ne transmet jamais Xᶜ",
        "→ Mère NON porteuse"
      ]
    },
    {
      number: 6,
      title: "Prédire l'état d'inactivation chez chaque fille",
      description: "Déterminer quel chromosome X est actif/inactif",
      example: [
        "Filles daltoniennes ⇒ X actif = Xᶜ(16)",
        "F1 : X⁺(12) inactivé, Xᶜ(16) actif",
        "F2 : X⁺(14) inactivé, Xᶜ(16) actif"
      ]
    },
    {
      number: 7,
      title: "Générer les profils « avec Hpa II »",
      description: "Seuls les chromosomes X inactifs survivent à la digestion",
      example: [
        "Garçons : ——— (0 pic, X actif digéré)",
        "F1 : |12| (X inactif 12 survit)",
        "F2 : |14| (X inactif 14 survit)"
      ]
    }
  ];

  return (
    <div className="container mx-auto p-4 space-y-4 max-w-5xl">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-2 bg-purple-100 rounded-full">
            <Dna className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analyse HUMARA</h1>
          <p className="text-base text-gray-600">
            Test d&apos;inactivation du chromosome X (X-inactivation)
          </p>
          <Badge variant="secondary" className="mt-2">
            Diagnostic moléculaire
          </Badge>
        </div>
      </div>

     
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-4 w-4 text-green-600" />
            Étapes d&apos;analyse
          </CardTitle>
          <CardDescription className="text-sm">
            Procédure complète pour l&apos;interprétation des résultats HUMARA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left Column - Steps 1-4 */}
            <div className="space-y-3">
              {steps.slice(0, 4).map((step, index) => (
                <div key={step.number} className="space-y-2">
                  {/* Step Header */}
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white text-xs">
                        Étape {step.number}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step Details - Always expanded */}
                  <div className="pl-3 border-l-2 border-green-200">
                    <div className="bg-white rounded-lg border p-3">
                      <h5 className="font-medium text-gray-800 mb-2 text-xs">Exemple d&apos;application :</h5>
                      <div className="space-y-1">
                        {step.example.map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            {line.startsWith('→') ? (
                              <>
                                <ArrowRight className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                <code className="text-xs font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                                  {line.slice(2)}
                                </code>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <code className="text-xs text-gray-700 font-mono">
                                  {line}
                                </code>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line (only for steps 1-3) */}
                  {index < 3 && (
                    <div className="flex justify-center py-1">
                      <div className="h-4 w-0.5 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column - Steps 5-7 */}
            <div className="space-y-3">
              {steps.slice(4).map((step, index) => (
                <div key={step.number} className="space-y-2">
                  {/* Step Header */}
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white text-xs">
                        Étape {step.number}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step Details - Always expanded */}
                  <div className="pl-3 border-l-2 border-green-200">
                    <div className="bg-white rounded-lg border p-3">
                      <h5 className="font-medium text-gray-800 mb-2 text-xs">Exemple d&apos;application :</h5>
                      <div className="space-y-1">
                        {step.example.map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            {line.startsWith('→') ? (
                              <>
                                <ArrowRight className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                <code className="text-xs font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                                  {line.slice(2)}
                                </code>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <code className="text-xs text-gray-700 font-mono">
                                  {line}
                                </code>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line (only for steps 5-6) */}
                  {index < 2 && (
                    <div className="flex justify-center py-1">
                      <div className="h-4 w-0.5 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Summary */}
      <Card className="border-blue-200 gap-1 p-3">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-4 w-4 text-blue-600" />
            HPAII - Generation des graphs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">Règles d&apos;interprétation</h4>
            <div className="space-y-2 text-xs text-blue-700">
              <div className="bg-white rounded p-2 border border-blue-200">
                <strong>Pour chaque individu :</strong>
                <br />nX = nombre de chromosomes X
              </div>
              
              <div className="bg-white rounded p-2 border border-blue-200">
                <strong>Si nX = 1 :</strong> (garçon ou monosomie X)
                <br />• Supprimer tous les pics (0 pic)
                <br />• Continuer individu suivant
              </div>
              
              <div className="bg-white rounded p-2 border border-blue-200">
                <strong>Si nX ≥ 2 :</strong> (cas classique)
                <br />• Déterminer quel(s) X sont actifs
                <br />• Pour chaque allèle HUMARA :
                <br />&nbsp;&nbsp;- Si allèle sur X actif → supprimer pic
                <br />&nbsp;&nbsp;- Si allèle sur X inactif → conserver pic
                <br />• Tracer les pics restants
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Results Example */}
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Microscope className="h-4 w-4 text-orange-600" />
            Exemple de sortie finale
          </CardTitle>
          <CardDescription className="text-sm">
            Schéma des pics après digestion Hpa II
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
              <div className="font-medium text-pink-800 text-sm">F1</div>
              <div className="mt-1 font-mono text-base">|12|</div>
              <div className="text-xs text-pink-600 mt-1">X(12) inactif conservé</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 text-sm">S1</div>
              <div className="mt-1 font-mono text-base">———</div>
              <div className="text-xs text-blue-600 mt-1">X actif digéré</div>
            </div>
            
            <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
              <div className="font-medium text-pink-800 text-sm">F2</div>
              <div className="mt-1 font-mono text-base">|14|</div>
              <div className="text-xs text-pink-600 mt-1">X(14) inactif conservé</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 text-sm">S2</div>
              <div className="mt-1 font-mono text-base">———</div>
              <div className="text-xs text-blue-600 mt-1">X actif digéré</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-600">
            <p><strong>Légende :</strong></p>
            <p>• F = Fille, S = Fils</p>
            <p>• |n| = Pic détecté (allèle n répétitions)</p>
            <p>• ——— = Aucun pic détecté</p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
} 