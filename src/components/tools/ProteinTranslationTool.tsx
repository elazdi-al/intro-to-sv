"use client";

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  cleanDNA, 
  findORFDetails, 
  getCodonBreakdown,
  designPCRPrimers,
  reverseComplement 
} from '@/lib/dna-utils';
import { useDNAStore } from '@/store/dna-store';

// Import modular components
import DNASequenceInput from './modules/DNASequenceInput';
import GenomicParameters from './modules/GenomicParameters';
import AnalysisResults from './modules/AnalysisResults';
import PCRPrimers from './modules/PCRPrimers';
import ElectrophoresisChart from './modules/ElectrophoresisChart';
import DetailedCalculations from './modules/DetailedCalculations';

// Import calculation utilities
import {
  calculateRestrictionFragments,
  calculateSequenceOccurrence,
  calculateMinPrimerLength,
  findRepeatsWithSuffixArray,
  generateElectrophoresisData,
  generateChartAnalysis,
  type RepeatPattern
} from './modules/dna-calculations';

export default function ProteinTranslationTool() {
  const { dnaSequence, setDnaSequence } = useDNAStore();
  const [genomeSize, setGenomeSize] = useState('');
  const [restrictionSite, setRestrictionSite] = useState('');
  const [analysisSequence, setAnalysisSequence] = useState('');
  const [primerLength, setPrimerLength] = useState('');

  // Exemple par défaut
  const exampleSequence = "ATGGTGAACGTGCAGCCCCGAAAGTGCATCTGGAATGATGATGATGATG";

  const cleanedDNA = useMemo(() => cleanDNA(dnaSequence), [dnaSequence]);
  const cleanedAnalysisSeq = useMemo(() => cleanDNA(analysisSequence), [analysisSequence]);
  
  const orfDetails = useMemo(() => 
    cleanedDNA ? findORFDetails(cleanedDNA) : null, 
    [cleanedDNA]
  );
  
  const codonBreakdown = useMemo(() => 
    orfDetails?.startPos ? getCodonBreakdown(cleanedDNA, orfDetails.startPos) : [],
    [cleanedDNA, orfDetails?.startPos]
  );

  // Auto-fill primer length when genome size is provided
  const effectivePrimerLength = useMemo(() => {
    if (primerLength) return primerLength;
    if (genomeSize) {
      const size = parseInt(genomeSize);
      if (!isNaN(size) && size > 0) {
        const minLength = calculateMinPrimerLength(size);
        return (minLength + 2).toString();
      }
    }
    return '';
  }, [primerLength, genomeSize]);

  const primers = useMemo(() => {
    if (!cleanedDNA || !effectivePrimerLength) return null;
    const length = parseInt(effectivePrimerLength);
    if (isNaN(length) || length < 8 || length > 30) return null;
    return designPCRPrimers(cleanedDNA, length);
  }, [cleanedDNA, effectivePrimerLength]);

  const genomeAnalysis = useMemo(() => {
    const size = parseInt(genomeSize);
    if (isNaN(size) || size <= 0) return null;

    const cleanedRestrictionSite = cleanDNA(restrictionSite);
    const fragments = restrictionSite ? calculateRestrictionFragments(size, cleanedRestrictionSite) : 0;
    
    const sequenceOccurrence = cleanedAnalysisSeq ? 
      calculateSequenceOccurrence(size, cleanedAnalysisSeq.length) : 0;
    
    const minPrimerLength = calculateMinPrimerLength(size);
    const recommendedPrimerLength = minPrimerLength + 2;

    return {
      genomeSize: size,
      restrictionSite: cleanedRestrictionSite,
      expectedFragments: fragments,
      analysisSequence: cleanedAnalysisSeq,
      expectedOccurrences: sequenceOccurrence,
      minPrimerLength,
      recommendedPrimerLength
    };
  }, [genomeSize, restrictionSite, cleanedAnalysisSeq]);
  
  // Analysis of repeat patterns for justification
  const repeatAnalysis = useMemo(() => {
    if (!cleanedDNA) return null;
    return findRepeatsWithSuffixArray(cleanedDNA);
  }, [cleanedDNA]);
  
  const { chartTicks, justificationText } = useMemo(() => 
    generateChartAnalysis(cleanedDNA || '', repeatAnalysis),
    [cleanedDNA, repeatAnalysis]
  );

  // Generate capillary electrophoresis data
  const electrophoresisData = useMemo(() => 
    generateElectrophoresisData(cleanedDNA || '', repeatAnalysis),
    [cleanedDNA, repeatAnalysis]
  );

  // Show Sonner warnings
  useEffect(() => {
    if (primerLength && genomeSize && primers) {
      toast.warning("Longueur manuelle d'amorces définie", {
        description: `Vérifiez la compatibilité avec le génome de ${parseInt(genomeSize).toLocaleString()} pb`,
        duration: 4000,
      });
    }
  }, [primerLength, genomeSize, primers]);

  useEffect(() => {
    if (dnaSequence && !cleanedDNA) {
      toast.error("Séquence invalide", {
        description: "Veuillez entrer une séquence ADN valide",
        duration: 3000,
      });
    }
  }, [dnaSequence, cleanedDNA]);

  useEffect(() => {
    if (!genomeSize && cleanedDNA) {
      toast.info("Analyse limitée", {
        description: "Ajoutez la taille du génome pour voir les calculs d'amorces optimales",
        duration: 5000,
      });
    }
  }, [genomeSize, cleanedDNA]);

  const handleExampleLoad = () => {
    setDnaSequence(exampleSequence);
    setGenomeSize('12000000');
    setRestrictionSite('GAATTC');
    setAnalysisSequence('cacccgaaacgacgtcgtaa');
  };

  return (
    <div className="space-y-6">
      {/* DNA Sequence Input */}
      <DNASequenceInput 
        onExampleLoad={handleExampleLoad}
      />

      {/* Genomic Parameters */}
      {cleanedDNA && (
        <GenomicParameters
          genomeSize={genomeSize}
          restrictionSite={restrictionSite}
          analysisSequence={analysisSequence}
          primerLength={primerLength}
          effectivePrimerLength={effectivePrimerLength}
          recommendedPrimerLength={genomeAnalysis?.recommendedPrimerLength}
          onGenomeSizeChange={setGenomeSize}
          onRestrictionSiteChange={setRestrictionSite}
          onAnalysisSequenceChange={setAnalysisSequence}
          onPrimerLengthChange={setPrimerLength}
        />
      )}

      {/* Analysis Results */}
      <AnalysisResults
        cleanedDNA={cleanedDNA}
        orfDetails={orfDetails}
        genomeAnalysis={genomeAnalysis}
        restrictionSite={restrictionSite}
        analysisSequence={analysisSequence}
      />

      {/* PCR Primers */}
      {primers && <PCRPrimers primers={primers} />}

      {/* Electrophoresis Chart and Detailed Calculations Side by Side */}
      {cleanedDNA && genomeAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Electrophoresis Chart - Left */}
          <div className="flex justify-center items-start">
            <div className="aspect-square w-full ">
              <ElectrophoresisChart
                data={electrophoresisData}
                dnaLength={cleanedDNA.length}
                chartTicks={chartTicks}
                justificationText={justificationText}
              />
            </div>
          </div>
          
          {/* Detailed Calculations - Right */}
          <DetailedCalculations
            genomeAnalysis={genomeAnalysis}
            restrictionSite={restrictionSite}
            analysisSequence={analysisSequence}
            cleanedDNA={cleanedDNA}
          />
        </div>
      )}

      {/* Electrophoresis Chart Only (when no genome analysis) */}
      {cleanedDNA && !genomeAnalysis && (
        <ElectrophoresisChart
          data={electrophoresisData}
          dnaLength={cleanedDNA.length}
          chartTicks={chartTicks}
          justificationText={justificationText}
        />
      )}

      {/* Detailed Calculations Only (when no DNA but genome analysis exists) */}
      {!cleanedDNA && genomeAnalysis && (
        <DetailedCalculations
          genomeAnalysis={genomeAnalysis}
          restrictionSite={restrictionSite}
          analysisSequence={analysisSequence}
          cleanedDNA={cleanedDNA}
        />
      )}
    </div>
  );
} 