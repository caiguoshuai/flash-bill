import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Ledger {
    id: string;
    name: string;
    cover: string; // Emoji
    role: 'owner' | 'member';
}

interface LedgerState {
    ledgers: Ledger[];
    currentLedger: Ledger | null;
    setCurrentLedger: (ledger: Ledger) => void;
    fetchLedgers: () => void;
    addLedger: (name: string, cover: string) => void;
}

export const useLedgerStore = create<LedgerState>()(
    persist(
        (set, get) => ({
            ledgers: [],
            currentLedger: null,

            fetchLedgers: () => {
                // Mock data
                const mockLedgers: Ledger[] = [
                    { id: 'ledger-1', name: '日常账本', cover: '📒', role: 'owner' },
                    { id: 'ledger-2', name: '家庭账本', cover: '🏠', role: 'owner' },
                    { id: 'ledger-3', name: '装修账本', cover: '🔨', role: 'owner' },
                ];

                // If state already has ledgers (from persist), maybe merge or ignore? 
                // For simple mock, just set if empty.
                const state = get();
                if (state.ledgers.length === 0) {
                    set({ ledgers: mockLedgers, currentLedger: mockLedgers[0] });
                } else if (!state.currentLedger) {
                    set({ currentLedger: state.ledgers[0] });
                }
            },

            setCurrentLedger: (ledger) => set({ currentLedger: ledger }),

            addLedger: (name, cover) => {
                const newLedger: Ledger = {
                    id: `ledger-${Date.now()}`,
                    name,
                    cover,
                    role: 'owner'
                };
                set((state) => ({
                    ledgers: [...state.ledgers, newLedger],
                    currentLedger: newLedger
                }));
            }
        }),
        {
            name: 'flash-bill-ledger-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
