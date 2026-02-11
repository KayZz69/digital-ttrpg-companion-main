# D&D 5e Game Data

This directory contains structured game data extracted from the D&D 5e Player's Handbook.

## Structure

- **types.ts** - TypeScript interfaces for all data types
- **races.ts** - Character races/species (Chapter 4 of PHB)
- **classes.ts** - Character classes (Chapter 3 of PHB)
- **spells.ts** - Spell database (Chapter 7 of PHB)
- **equipment.ts** - Weapons, armor, and adventuring gear (Chapter 6 of PHB)
- **index.ts** - Central export point

## How to Populate

Each file contains:
1. Complete TypeScript interfaces showing the data structure
2. A few sample entries demonstrating the pattern
3. TODO comments indicating where to add more data

### Steps to Add Data:

1. **Open the Player's Handbook** markdown file you've uploaded
2. **Navigate to the relevant chapter**:
   - Chapter 3 for Classes
   - Chapter 4 for Races/Species
   - Chapter 6 for Equipment
   - Chapter 7 for Spells

3. **Extract the mechanical data** (stats, numbers, rules):
   - Focus on game mechanics, not long narrative descriptions
   - Include ability scores, proficiencies, features, etc.
   - Keep descriptions concise (1-2 sentences)

4. **Follow the existing patterns** in each file
5. **Test as you go** - import and use the data in components
