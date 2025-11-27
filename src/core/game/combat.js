import { getCharRuntimeState, setCharRuntimeState, acquireLock, releaseLock } from "./state.js";

export async function processCastSpell(casterId, spellId, targetId) {
  const lockA = await acquireLock(`char:${casterId}`, 5000);
  const lockB = await acquireLock(`char:${targetId}`, 5000);

  try {
    const caster = await getCharRuntimeState(casterId);
    const target = await getCharRuntimeState(targetId);

    if (!caster || !target) return { ok: false, reason: "invalid_target_or_caster" };

    if (caster.hp <= 0) return { ok: false, reason: "caster_dead" };
    if (target.hp <= 0) return { ok: false, reason: "target_dead" };

    // Simple spell defs (in real app: DB)
    const spell = getSpellDefinition(spellId);
    if (!spell) return { ok: false, reason: "invalid_spell" };

    const now = Date.now();
    if (caster.cooldowns && caster.cooldowns[spellId] && caster.cooldowns[spellId] > now) {
      return { ok: false, reason: "cooldown" };
    }

    if ((caster.mp || 0) < spell.mana_cost) {
      return { ok: false, reason: "no_mana" };
    }

    const dist = Math.hypot((caster.pos.x - target.pos.x), (caster.pos.y - target.pos.y));
    if (dist > spell.range) return { ok: false, reason: "out_of_range" };

    // Apply spell effects
    const base = spell.effect.damage || 0;
    const casterSpellPower = caster.attributes?.spellPower || 0;
    const targetResist = target.attributes?.resistence || 0;
    const damage = Math.max(0, Math.round(base + casterSpellPower - targetResist));

    // Update target HP
    target.hp = Math.max(0, (target.hp || 0) - damage);
    caster.mp = (caster.mp || 0) - spell.mana_cost;
    caster.cooldowns = caster.cooldowns || {};
    caster.cooldowns[spellId] = now + (spell.cooldown || 1000);

    await setCharRuntimeState(casterId, caster);
    await setCharRuntimeState(targetId, target);

    const res = {
      ok: true,
      type: "spell_cast",
      casterId,
      targetId,
      spellId,
      damage,
      targetHp: target.hp,
      ts: now,
    };

    return res
  } finally {
    if (lockA) await releaseLock(`char:${casterId}`, lockA);
    if (lockB) await releaseLock(`char:${targetId}`, lockB);
  }
}

function getSpellDefinition(spellId) {
  // Example spells; in production read from DB
  const spells = {
    1: { id: 1, name: "Expelliarmus", mana_cost: 10, cooldown: 1500, range: 6, effect: { damage: 8 } },
    2: { id: 2, name: "Stupefy", mana_cost: 12, cooldown: 2000, range: 5, effect: { damage: 12 } },
  };
  return spells[spellId] || null;
}