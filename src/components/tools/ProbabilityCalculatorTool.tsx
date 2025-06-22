"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Lightbulb,
  Plus,
  Trash2,
  X
} from 'lucide-react';

// Utility function to find GCD
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

interface Person {
  id: string;
  name: string;
  type: 'parent' | 'child';
  alleles: Record<string, string[]>; // chromosome -> alleles
}

export default function ProbabilityCalculatorTool() {
  const [chromosomes, setChromosomes] = useState<string[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const addChromosome = () => {
    const newChr = `Chr${chromosomes.length + 1}`;
    setChromosomes([...chromosomes, newChr]);
    
    // Add empty alleles for this chromosome to all people
    setPeople(people.map(person => ({
      ...person,
      alleles: { ...person.alleles, [newChr]: [''] }
    })));
  };

  const removeChromosome = (chrIndex: number) => {
    const chrToRemove = chromosomes[chrIndex];
    setChromosomes(chromosomes.filter((_, i) => i !== chrIndex));
    
    // Remove alleles for this chromosome from all people
    setPeople(people.map(person => {
      const newAlleles = { ...person.alleles };
      delete newAlleles[chrToRemove];
      return { ...person, alleles: newAlleles };
    }));
  };

  const updateChromosomeName = (chrIndex: number, newName: string) => {
    const oldName = chromosomes[chrIndex];
    const newChromosomes = [...chromosomes];
    newChromosomes[chrIndex] = newName;
    setChromosomes(newChromosomes);
    
    // Update alleles mapping for all people
    if (oldName !== newName) {
      setPeople(people.map(person => {
        const newAlleles = { ...person.alleles };
        if (newAlleles[oldName]) {
          newAlleles[newName] = newAlleles[oldName];
          delete newAlleles[oldName];
        }
        return { ...person, alleles: newAlleles };
      }));
    }
  };

  const addPerson = (type: 'parent' | 'child') => {
    const newPerson: Person = {
      id: `${type}_${Date.now()}`,
      name: '',
      type,
      alleles: chromosomes.reduce((acc, chr) => ({ ...acc, [chr]: [''] }), {})
    };
    setPeople([...people, newPerson]);
  };

  const removePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId));
  };

  const updatePersonName = (personId: string, name: string) => {
    setPeople(people.map(person => 
      person.id === personId ? { ...person, name } : person
    ));
  };

  const updatePersonAlleles = (personId: string, chromosome: string, alleles: string[]) => {
    setPeople(people.map(person => 
      person.id === personId 
        ? { ...person, alleles: { ...person.alleles, [chromosome]: alleles } }
        : person
    ));
  };

  const addAllele = (personId: string, chromosome: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const currentAlleles = person.alleles[chromosome] || [];
      updatePersonAlleles(personId, chromosome, [...currentAlleles, '']);
    }
  };

  const updateAllele = (personId: string, chromosome: string, alleleIndex: number, value: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const currentAlleles = [...(person.alleles[chromosome] || [])];
      currentAlleles[alleleIndex] = value;
      updatePersonAlleles(personId, chromosome, currentAlleles);
    }
  };

  const removeAllele = (personId: string, chromosome: string, alleleIndex: number) => {
    const person = people.find(p => p.id === personId);
    if (person && person.alleles[chromosome]?.length > 1) {
      const currentAlleles = person.alleles[chromosome].filter((_, i) => i !== alleleIndex);
      updatePersonAlleles(personId, chromosome, currentAlleles);
    }
  };

  const loadExample = () => {
    setChromosomes(['Chromosome 3', 'Chromosome 11', 'Chromosome 15', 'Chromosome 18']);
    setPeople([
      {
        id: 'paul',
        name: 'Paul',
        type: 'parent',
        alleles: {
          'Chromosome 3': ['16', '18'],
          'Chromosome 11': ['6', '9'],
          'Chromosome 15': ['7', '12'],
          'Chromosome 18': ['13', '14']
        }
      },
      {
        id: 'caroline',
        name: 'Caroline',
        type: 'parent',
        alleles: {
          'Chromosome 3': ['15', '17'],
          'Chromosome 11': ['6', '9'],
          'Chromosome 15': ['5', '10'],
          'Chromosome 18': ['18']
        }
      },
      {
        id: 'sophie',
        name: 'Sophie',
        type: 'child',
        alleles: {
          'Chromosome 3': ['15', '16'],
          'Chromosome 11': ['6'],
          'Chromosome 15': ['10', '12'],
          'Chromosome 18': ['13', '18']
        }
      }
    ]);
  };

  const calculations = useMemo(() => {
    const parents = people.filter(p => p.type === 'parent');
    const children = people.filter(p => p.type === 'child');
    
    if (parents.length < 2 || chromosomes.length === 0) {
      return { locusProbs: [], identicalProfileProb: null, childMatchProbs: [] };
    }

    const [parent1, parent2] = parents;
    
    const locusProbs = chromosomes.map(chr => {
      const p1Alleles = (parent1.alleles[chr] || []).filter(a => a.trim() !== '');
      const p2Alleles = (parent2.alleles[chr] || []).filter(a => a.trim() !== '');
      
      if (p1Alleles.length === 0 || p2Alleles.length === 0) {
        return {
          locus: chr,
          probabilities: {} as Record<string, { numerator: number, denominator: number }>,
          total: 0
        };
      }
      
      const possibleCombinations = [];
      for (const a1 of p1Alleles) {
        for (const a2 of p2Alleles) {
          const combination = [a1, a2].sort();
          possibleCombinations.push(combination);
        }
      }
      
      const genotypeCounts: Record<string, number> = {};
      possibleCombinations.forEach(combo => {
        const key = combo.join(',');
        genotypeCounts[key] = (genotypeCounts[key] || 0) + 1;
      });
      
      const total = possibleCombinations.length;
      const probabilities: Record<string, { numerator: number, denominator: number }> = {};
      Object.entries(genotypeCounts).forEach(([genotype, count]) => {
        const g = gcd(count, total);
        probabilities[genotype] = { numerator: count / g, denominator: total / g };
      });
      
      return {
        locus: chr,
        probabilities,
        total
      };
    });

    // Calculate identical profile probability (probability that two children have the same genotype at each locus)
    let identicalNum = 1;
    let identicalDenom = 1;
    let hasValidData = false;

    locusProbs.forEach(locus => {
      if (Object.keys(locus.probabilities).length === 0) return;
      hasValidData = true;
      
      // For each locus, sum p_i^2 for all possible genotypes i
      // This gives the probability that two independent children have the same genotype at this locus
      let locusNum = 0;
      let locusDenom = 1;
      
      Object.values(locus.probabilities).forEach(prob => {
        // Add prob^2 to the sum
        const probSquaredNum = prob.numerator * prob.numerator;
        const probSquaredDenom = prob.denominator * prob.denominator;
        
        // Add fractions: locusNum/locusDenom + probSquaredNum/probSquaredDenom
        const commonDenom = locusDenom * probSquaredDenom;
        const newNum = locusNum * probSquaredDenom + probSquaredNum * locusDenom;
        const g = gcd(newNum, commonDenom);
        
        locusNum = newNum / g;
        locusDenom = commonDenom / g;
      });
      
      // Multiply this locus probability with the cumulative probability
      const newNum = identicalNum * locusNum;
      const newDenom = identicalDenom * locusDenom;
      const g = gcd(newNum, newDenom);
      
      identicalNum = newNum / g;
      identicalDenom = newDenom / g;
    });

    const identicalProfileProb = hasValidData ? { numerator: identicalNum, denominator: identicalDenom } : null;

    // Calculate match probabilities for each child
    const childMatchProbs = children.map(child => {
      let matchNum = 1;
      let matchDenom = 1;
      let hasValidProfile = false;
      let hasInvalidGenotype = false;

      locusProbs.forEach((locus) => {
        if (Object.keys(locus.probabilities).length === 0) return;
        
        const childAlleles = (child.alleles[locus.locus] || []).filter(a => a.trim() !== '');
        if (childAlleles.length === 0) return;
        
        // Handle single allele (homozygous) vs multiple alleles
        let childGenotype;
        if (childAlleles.length === 1) {
          // Single allele means homozygous (e.g., "6" becomes "6,6")
          childGenotype = [childAlleles[0], childAlleles[0]].sort().join(',');
        } else {
          // Multiple alleles
          childGenotype = childAlleles.sort().join(',');
        }
        
        const prob = locus.probabilities[childGenotype];
        
        if (prob) {
          hasValidProfile = true;
          const newNum = matchNum * prob.numerator;
          const newDenom = matchDenom * prob.denominator;
          const g = gcd(newNum, newDenom);
          
          matchNum = newNum / g;
          matchDenom = newDenom / g;
        } else if (childAlleles.length > 0) {
          // Child has a genotype that's impossible from these parents
          hasInvalidGenotype = true;
        }
      });

      return {
        name: child.name,
        probability: hasInvalidGenotype ? { numerator: 0, denominator: 1 } : 
                    hasValidProfile ? { numerator: matchNum, denominator: matchDenom } : null
      };
    });

    return {
      locusProbs,
      identicalProfileProb,
      childMatchProbs
    };
  }, [people, chromosomes]);

  const parents = people.filter(p => p.type === 'parent');
  const children = people.filter(p => p.type === 'child');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculateur de Génétique Familiale
          </CardTitle>
          <CardDescription>
            Analysez les profils génétiques familiaux
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadExample} variant="outline" size="sm">
              <Calculator className="h-4 w-4 mr-1" />
              Charger exemple
            </Button>
            <Button onClick={addChromosome} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter chromosome
            </Button>
            <Button onClick={() => addPerson('parent')} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter parent
            </Button>
            <Button onClick={() => addPerson('child')} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter enfant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      {(chromosomes.length > 0 || people.length > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Header Row */}
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 p-3 text-left font-semibold min-w-[120px]">
                      Individu
                    </th>
                    {chromosomes.map((chr, index) => (
                      <th key={index} className="border border-gray-300 bg-gray-200 p-3 text-center min-w-[150px]">
                        <div className="space-y-2">
                          <Input
                            value={chr}
                            onChange={(e) => updateChromosomeName(index, e.target.value)}
                            className="text-center font-semibold text-sm h-8"
                            placeholder="Nom chromosome"
                          />
                          <Button
                            onClick={() => removeChromosome(index)}
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Parents Section */}
                {parents.length > 0 && (
                  <tbody>
                    {parents.map((person) => (
                      <tr key={person.id}>
                        <td className="border border-gray-300 bg-blue-50 p-3">
                          <div className="flex items-center justify-between">
                            <Input
                              value={person.name}
                              onChange={(e) => updatePersonName(person.id, e.target.value)}
                              placeholder="Nom parent"
                              className="font-semibold text-blue-700 h-8"
                            />
                            <Button
                              onClick={() => removePerson(person.id)}
                              size="sm"
                              variant="destructive"
                              className="ml-2 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        {chromosomes.map((chr) => (
                          <td key={chr} className="border border-gray-300 p-3">
                            <div className="space-y-1">
                              {(person.alleles[chr] || []).map((allele, alleleIndex) => (
                                <div key={alleleIndex} className="flex items-center gap-1">
                                  <Input
                                    value={allele}
                                    onChange={(e) => updateAllele(person.id, chr, alleleIndex, e.target.value)}
                                    placeholder={`Allèle ${alleleIndex + 1}`}
                                    className="text-center h-7 text-sm"
                                  />
                                  {person.alleles[chr]?.length > 1 && (
                                    <Button
                                      onClick={() => removeAllele(person.id, chr, alleleIndex)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                onClick={() => addAllele(person.id, chr)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                )}

                {/* Children Section */}
                {children.length > 0 && (
                  <tbody>
                    {children.map((person) => (
                      <tr key={person.id}>
                        <td className="border border-gray-300 bg-purple-50 p-3">
                          <div className="flex items-center justify-between">
                            <Input
                              value={person.name}
                              onChange={(e) => updatePersonName(person.id, e.target.value)}
                              placeholder="Nom enfant"
                              className="font-semibold text-purple-700 h-8"
                            />
                            <Button
                              onClick={() => removePerson(person.id)}
                              size="sm"
                              variant="destructive"
                              className="ml-2 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        {chromosomes.map((chr) => (
                          <td key={chr} className="border border-gray-300 p-3">
                            <div className="space-y-1">
                              {(person.alleles[chr] || []).map((allele, alleleIndex) => (
                                <div key={alleleIndex} className="flex items-center gap-1">
                                  <Input
                                    value={allele}
                                    onChange={(e) => updateAllele(person.id, chr, alleleIndex, e.target.value)}
                                    placeholder={`Allèle ${alleleIndex + 1}`}
                                    className="text-center h-7 text-sm"
                                  />
                                  {person.alleles[chr]?.length > 1 && (
                                    <Button
                                      onClick={() => removeAllele(person.id, chr, alleleIndex)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                onClick={() => addAllele(person.id, chr)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {chromosomes.length > 0 && parents.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résultats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Probabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded border-blue-200 border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {calculations.identicalProfileProb ? 
                    `${calculations.identicalProfileProb.numerator}/${calculations.identicalProfileProb.denominator}` : 
                    '–'
                  }
                </div>
                <div className="text-sm text-blue-800">
                  Probabilité que deux enfants aient un profil identique
                </div>
              </div>

              <div className="space-y-2">
                {calculations.childMatchProbs.map((childProb, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded border-purple-200 border text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {childProb.probability ? 
                        `${childProb.probability.numerator}/${childProb.probability.denominator}` : 
                        '–'
                      }
                    </div>
                    <div className="text-xs text-purple-800">
                      {childProb.name || `Enfant ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {calculations.locusProbs.map((locus, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium text-sm mb-2">{locus.locus}</div>
                  {Object.keys(locus.probabilities).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(locus.probabilities).map(([genotype, prob]) => (
                        <div key={genotype} className="flex justify-between text-xs">
                          <span className="font-mono">{genotype.replace(',', '/')}</span>
                          <span>{prob.numerator}/{prob.denominator}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-2">
                      Données manquantes
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Calculation Steps */}
            {calculations.identicalProfileProb && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Calcul détaillé - Probabilité que deux enfants aient des profils identiques:</strong>
                  <br />
                  {calculations.locusProbs.map((locus, index) => {
                    if (Object.keys(locus.probabilities).length === 0) return null;
                    
                    // Calculate the sum of squared probabilities for this locus
                    let sumSquaredNum = 0;
                    let sumSquaredDenom = 1;
                    
                    Object.values(locus.probabilities).forEach(prob => {
                      const probSquaredNum = prob.numerator * prob.numerator;
                      const probSquaredDenom = prob.denominator * prob.denominator;
                      
                      const commonDenom = sumSquaredDenom * probSquaredDenom;
                      const newNum = sumSquaredNum * probSquaredDenom + probSquaredNum * sumSquaredDenom;
                      const g = gcd(newNum, commonDenom);
                      
                      sumSquaredNum = newNum / g;
                      sumSquaredDenom = commonDenom / g;
                    });
                    
                    return (
                      <span key={index}>
                        {locus.locus}: {Object.entries(locus.probabilities).map(([genotype, prob]) => 
                          `(${prob.numerator}/${prob.denominator})²`
                        ).join(' + ')} = {sumSquaredNum}/{sumSquaredDenom}
                        {index < calculations.locusProbs.length - 1 ? ' × ' : ''}
                      </span>
                    );
                  })}
                  <br />
                  = <strong>{calculations.identicalProfileProb.numerator}/{calculations.identicalProfileProb.denominator}</strong>
                  <br /><br />
                  {calculations.childMatchProbs.map((childProb, childIndex) => (
                    childProb.probability && (
                      <div key={childIndex}>
                        <strong>Probabilité qu'un enfant ait le même profil que {childProb.name}:</strong>
                        <br />
                        {calculations.locusProbs.map((locus, index) => {
                          const child = children.find(c => c.name === childProb.name);
                          if (!child) return null;
                          
                          const childAlleles = (child.alleles[locus.locus] || []).filter(a => a.trim() !== '');
                          if (childAlleles.length === 0) return null;
                          
                          // Handle single allele (homozygous) vs multiple alleles
                          let childGenotype;
                          if (childAlleles.length === 1) {
                            // Single allele means homozygous
                            childGenotype = [childAlleles[0], childAlleles[0]].sort().join(',');
                          } else {
                            // Multiple alleles
                            childGenotype = childAlleles.sort().join(',');
                          }
                          
                          const prob = locus.probabilities[childGenotype];
                          
                          if (!prob) return null;
                          
                          return (
                            <span key={index}>
                              {locus.locus}: {prob.numerator}/{prob.denominator}
                              {index < calculations.locusProbs.length - 1 ? ' × ' : ''}
                            </span>
                          );
                        })}
                        <br />
                        = <strong>{childProb.probability.numerator}/{childProb.probability.denominator}</strong>
                        <br /><br />
                      </div>
                    )
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 