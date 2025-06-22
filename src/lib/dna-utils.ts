// DNA Analysis Utilities
// Ported from Python version with TypeScript types

export interface CodonTable {
  [key: string]: string;
}

export interface ORFDetails {
  protein: string;
  startPos: number | null;
  stopPos: number | null;
  stopCodon: string;
}

export interface Mutation {
  type: 'substitution' | 'insertion' | 'deletion';
  position: number;
  base: string;
  description: string;
}

export const CODON_TABLE: CodonTable = {
  // Phe / Leu
  "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
  // Leu
  "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
  // Ile / Met
  "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
  // Val
  "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
  // Ser
  "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S", "AGT": "S", "AGC": "S",
  // Pro
  "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
  // Thr
  "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
  // Ala
  "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
  // Tyr / STOP
  "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
  // His / Gln
  "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
  // Asn / Lys
  "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
  // Asp / Glu
  "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
  // Cys / Trp / STOP
  "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
  // Arg
  "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R", "AGA": "R", "AGG": "R",
  // Gly
  "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
};

export const STOP_CODONS = new Set(["TAA", "TAG", "TGA"]);

export const AMINO_ACID_NAMES: { [key: string]: string } = {
  "A": "Alanine", "R": "Arginine", "N": "Asparagine", "D": "Acide aspartique",
  "C": "Cystéine", "Q": "Glutamine", "E": "Acide glutamique", "G": "Glycine",
  "H": "Histidine", "I": "Isoleucine", "L": "Leucine", "K": "Lysine",
  "M": "Méthionine", "F": "Phénylalanine", "P": "Proline", "S": "Sérine",
  "T": "Thréonine", "W": "Tryptophane", "Y": "Tyrosine", "V": "Valine",
  "*": "STOP", "X": "Inconnu"
};

export const GENOME_SIZES = {
  "E. coli": 4.6e6,
  "S. cerevisiae (levure)": 12e6,
  "Humain": 3e9,
};

/**
 * Supprime tout ce qui n'est pas A/C/G/T et retourne l'ADN en majuscules
 */
export function cleanDNA(raw: string): string {
  return raw.toUpperCase().replace(/[^ACGT]/g, '');
}

/**
 * Retourne le complément inverse de la séquence ADN
 */
export function reverseComplement(dna: string): string {
  const complement: { [key: string]: string } = {
    'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'
  };
  
  return dna
    .split('')
    .reverse()
    .map(base => complement[base] || base)
    .join('');
}

/**
 * Traduit le premier ORF commençant par ATG jusqu'au premier codon stop en phase
 */
export function translateORF(dna: string): string {
  const startIndex = dna.indexOf("ATG");
  if (startIndex === -1) return "";
  
  const aminoAcids: string[] = [];
  
  for (let i = startIndex; i < dna.length - 2; i += 3) {
    const codon = dna.substr(i, 3);
    if (STOP_CODONS.has(codon)) break;
    aminoAcids.push(CODON_TABLE[codon] || "X");
  }
  
  return aminoAcids.join('');
}

/**
 * Trouve les détails de l'ORF : protéine, pos début, pos fin, codon stop
 */
export function findORFDetails(dna: string): ORFDetails {
  const startIndex = dna.indexOf("ATG");
  if (startIndex === -1) {
    return {
      protein: "",
      startPos: null,
      stopPos: null,
      stopCodon: "Aucun codon start trouvé"
    };
  }
  
  for (let i = startIndex; i < dna.length - 2; i += 3) {
    const codon = dna.substr(i, 3);
    if (STOP_CODONS.has(codon)) {
      const protein = translateORF(dna);
      return {
        protein,
        startPos: startIndex + 1, // 1-based
        stopPos: i + 1, // 1-based
        stopCodon: codon
      };
    }
  }
  
  const protein = translateORF(dna);
  return {
    protein,
    startPos: startIndex + 1, // 1-based
    stopPos: null,
    stopCodon: "Aucun codon stop en phase"
  };
}

/**
 * Applique une mutation unique à la séquence
 */
export function applyMutation(
  seq: string, 
  mutType: 'substitution' | 'insertion' | 'deletion', 
  position: number, 
  newBase: string = ""
): string {
  const pos0 = position - 1; // Conversion en base 0
  
  switch (mutType) {
    case 'substitution':
      return seq.substring(0, pos0) + newBase.toUpperCase() + seq.substring(pos0 + 1);
    case 'insertion':
      return seq.substring(0, position) + newBase.toUpperCase() + seq.substring(position);
    case 'deletion':
      return seq.substring(0, pos0) + seq.substring(position);
    default:
      return seq;
  }
}

/**
 * Formate la description de la mutation
 */
export function formatMutationDescription(
  mutType: 'substitution' | 'insertion' | 'deletion',
  position: number,
  newBase: string,
  sequence: string
): string {
  if (position <= sequence.length && position > 0) {
    const origBase = sequence[position - 1];
    switch (mutType) {
      case 'substitution':
        return `${origBase}→${newBase}`;
      case 'insertion':
        return `Insérer ${newBase} après ${origBase}`;
      case 'deletion':
        return `Supprimer ${origBase}`;
    }
  }
  return "Position invalide";
}

/**
 * Conçoit les amorces forward et reverse pour PCR
 */
export function designPCRPrimers(sequence: string, primerLength: number = 14): {
  forward: string;
  reverse: string;
} {
  const forward = sequence.substring(0, primerLength);
  const reverse = reverseComplement(sequence.substring(sequence.length - primerLength));
  return { forward, reverse };
}



/**
 * Calcule la longueur minimale d'amorce pour l'unicité génomique
 */
export function calculatePrimerLength(genomeSize: number): number {
  let n = 1;
  while (Math.pow(4, n) <= genomeSize) {
    n++;
  }
  return n;
}

/**
 * Détaille la traduction codon par codon
 */
export function getCodonBreakdown(sequence: string, startPos: number): Array<{
  position: string;
  codon: string;
  aminoAcid: string;
  fullName: string;
}> {
  const startIdx = startPos - 1;
  const codons: Array<{
    position: string;
    codon: string;
    aminoAcid: string;
    fullName: string;
  }> = [];
  
  for (let i = startIdx; i < sequence.length - 2; i += 3) {
    const codon = sequence.substr(i, 3);
    const aa = CODON_TABLE[codon] || "X";
    
    codons.push({
      position: `${i + 1}-${i + 3}`,
      codon,
      aminoAcid: aa,
      fullName: AMINO_ACID_NAMES[aa] || "Inconnu"
    });
    
    if (STOP_CODONS.has(codon)) break;
  }
  
  return codons;
} 