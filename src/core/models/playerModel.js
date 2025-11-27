import db from "../../db/postgres.js";

export async function loadPlayerById(id) {
  const res = await db.query("SELECT * FROM players WHERE id = $1", [id]);
  
  if (res.rowCount === 0) return null;
  const player = res.rows[0];
  const attr = await db.query("SELECT * FROM player_attributes WHERE player_id = $1", [id]);
  player.attributes = attr.rows[0] || null;
  const inv = await db.query("SELECT item_id, quantity, slot FROM player_inventory WHERE player_id = $1", [id]);
  player.inventory = inv.rows;
  const equip = await db.query("SELECT slot, item_id FROM player_equipment WHERE player_id = $1", [id]);
  player.equipment = equip.rows;
  return player;
}

export async function savePlayerState(id, state) {
  if (!state) return;
  if (state.attributes) {
    await db.query(
      `
      INSERT INTO player_attributes(player_id, hp, mp, strength, agility, magic)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (player_id) DO UPDATE SET hp = EXCLUDED.hp, mp = EXCLUDED.mp, strength = EXCLUDED.strength, agility = EXCLUDED.agility, magic = EXCLUDED.magic
    `,
      [
        id,
        state.attributes.hp || 0,
        state.attributes.mp || 0,
        state.attributes.strength || 0,
        state.attributes.agility || 0,
        state.attributes.magic || 0,
      ]
    );
  }

  if (state.position) {
    await db.query("UPDATE players SET updated_at = now() WHERE id = $1", [id]);
    // -- position persistence can be extended by a dedicated table
  }
}
