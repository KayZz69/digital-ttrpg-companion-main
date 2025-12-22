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

## Copyright Notice

When populating this data:
- Extract mechanical information (stats, rules, numbers)
- Keep descriptions brief and functional
- Do not copy large blocks of creative text verbatim
- Focus on what's needed for gameplay functionality

The data structure and sample entries are provided to show you the pattern. You are responsible for ensuring your use of the source material complies with applicable laws and licenses.

## Priority Order

Suggest populating in this order:
1. **Classes** - Focus on the 3-4 most common classes first (Fighter, Wizard, Cleric, Rogue)
2. **Spells** - Start with cantrips and level 1 spells for your implemented classes
3. **Equipment** - Add common starting equipment
4. **Races** - Complete the 10 core races
5. **Expand** - Add remaining classes, spells, and equipment as needed
