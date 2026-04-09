/**
 * @fileoverview Spell section wrapper — conditionally renders SpellsManager
 * only for spellcasting classes.
 */

import { SpellsManager } from "@/components/SpellsManager";
import { DnD5eAbilityScores, SpellSlots, PreparedSpell } from "@/types/character";

const EMPTY_SPELL_SLOTS: SpellSlots = {
  level1: { current: 0, max: 0 },
  level2: { current: 0, max: 0 },
  level3: { current: 0, max: 0 },
  level4: { current: 0, max: 0 },
  level5: { current: 0, max: 0 },
  level6: { current: 0, max: 0 },
  level7: { current: 0, max: 0 },
  level8: { current: 0, max: 0 },
  level9: { current: 0, max: 0 },
};

interface SpellListProps {
  spellcastingAbility?: string;
  spellSlots?: SpellSlots;
  preparedSpells: PreparedSpell[];
  characterClass: string;
  abilityScores: DnD5eAbilityScores;
  level: number;
  activeConcentrationSpell: string | null;
  onUpdateSpellSlots: (slots: SpellSlots) => void;
  onUpdatePreparedSpells: (spells: PreparedSpell[]) => void;
  onConcentrationChange: (spellName: string | null) => void;
}

export const SpellList = ({
  spellcastingAbility,
  spellSlots,
  preparedSpells,
  characterClass,
  abilityScores,
  level,
  activeConcentrationSpell,
  onUpdateSpellSlots,
  onUpdatePreparedSpells,
  onConcentrationChange,
}: SpellListProps) => {
  if (!spellcastingAbility) return null;

  return (
    <div className="mb-6">
      <SpellsManager
        spellSlots={spellSlots || EMPTY_SPELL_SLOTS}
        preparedSpells={preparedSpells}
        characterClass={characterClass}
        spellcastingAbility={spellcastingAbility}
        abilityScores={abilityScores}
        level={level}
        onUpdateSpellSlots={onUpdateSpellSlots}
        onUpdatePreparedSpells={onUpdatePreparedSpells}
        activeConcentrationSpell={activeConcentrationSpell}
        onConcentrationChange={onConcentrationChange}
      />
    </div>
  );
};
