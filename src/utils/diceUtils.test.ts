import { describe, it, expect, vi } from 'vitest';
import { rollDice, createDiceRoll, formatRollResult } from './diceUtils';

// Mock crypto.randomUUID for consistent test results
vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid-123',
});

describe('diceUtils', () => {
    describe('rollDice', () => {
        it('returns a number between 1 and the number of sides', () => {
            // Run multiple times to test randomness bounds
            for (let i = 0; i < 100; i++) {
                const result = rollDice(6);
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(6);
            }
        });

        it('works with different dice sizes', () => {
            const d20 = rollDice(20);
            expect(d20).toBeGreaterThanOrEqual(1);
            expect(d20).toBeLessThanOrEqual(20);

            const d4 = rollDice(4);
            expect(d4).toBeGreaterThanOrEqual(1);
            expect(d4).toBeLessThanOrEqual(4);
        });
    });

    describe('createDiceRoll', () => {
        it('creates a roll with correct structure', () => {
            const roll = createDiceRoll('d20', 1, 5, 'normal', 'Attack roll');

            expect(roll).toHaveProperty('id');
            expect(roll).toHaveProperty('timestamp');
            expect(roll.diceType).toBe('d20');
            expect(roll.numberOfDice).toBe(1);
            expect(roll.modifier).toBe(5);
            expect(roll.mode).toBe('normal');
            expect(roll.description).toBe('Attack roll');
            expect(roll.results).toHaveLength(1);
        });

        it('applies modifier correctly to total', () => {
            // We can't predict the random roll, but we can verify the math
            const roll = createDiceRoll('d6', 1, 3, 'normal');
            expect(roll.total).toBe(roll.results[0] + 3);
        });

        it('rolls multiple dice and sums them', () => {
            const roll = createDiceRoll('d6', 3, 0, 'normal');
            expect(roll.results).toHaveLength(3);
            expect(roll.total).toBe(roll.results.reduce((a, b) => a + b, 0));
        });

        it('handles advantage mode (highest of two rolls)', () => {
            const roll = createDiceRoll('d20', 1, 0, 'advantage');
            expect(roll.results).toHaveLength(2);
            expect(roll.total).toBe(Math.max(...roll.results));
        });

        it('handles disadvantage mode (lowest of two rolls)', () => {
            const roll = createDiceRoll('d20', 1, 0, 'disadvantage');
            expect(roll.results).toHaveLength(2);
            expect(roll.total).toBe(Math.min(...roll.results));
        });
    });

    describe('formatRollResult', () => {
        it('formats a simple roll correctly', () => {
            const roll = createDiceRoll('d20', 1, 0, 'normal');
            const formatted = formatRollResult(roll);
            expect(formatted).toContain('1d20');
            expect(formatted).toContain(`= ${roll.total}`);
        });

        it('includes modifier in format', () => {
            const roll = createDiceRoll('d20', 1, 5, 'normal');
            const formatted = formatRollResult(roll);
            expect(formatted).toContain('+5');
        });

        it('shows advantage indicator', () => {
            const roll = createDiceRoll('d20', 1, 0, 'advantage');
            const formatted = formatRollResult(roll);
            expect(formatted).toContain('(Advantage)');
        });

        it('shows disadvantage indicator', () => {
            const roll = createDiceRoll('d20', 1, 0, 'disadvantage');
            const formatted = formatRollResult(roll);
            expect(formatted).toContain('(Disadvantage)');
        });
    });
});
