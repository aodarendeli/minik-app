import { Chip, ChipGroup } from '@/design-system';

import { babyTone } from './baby-format';
import { useActiveBaby } from './active-baby';

/** Chip row to switch between babies; renders nothing for a single baby. */
export function BabySwitcher() {
  const { babies, baby, select } = useActiveBaby();
  if (babies.length < 2) return null;
  return (
    <ChipGroup>
      {babies.map((b) => (
        <Chip key={b.id} label={b.name} selected={b.id === baby?.id} tone={babyTone(b.color)} onPress={() => select(b.id)} />
      ))}
    </ChipGroup>
  );
}
