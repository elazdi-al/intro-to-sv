import { create } from 'zustand';

interface DNAStore {
  dnaSequence: string;
  setDnaSequence: (sequence: string) => void;
  clearDnaSequence: () => void;
}

export const useDNAStore = create<DNAStore>()((set) => ({
  dnaSequence: '',
  setDnaSequence: (sequence: string) => set({ dnaSequence: sequence }),
  clearDnaSequence: () => set({ dnaSequence: '' }),
})); 