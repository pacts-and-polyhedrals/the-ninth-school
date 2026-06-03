/**
 * The Ninth School — Foundry VTT Module v1.0.0
 * School of Orthogenesis, Whispered Agony Cleric, Forbidden Secrets Paladin
 * Created by DM Asmo / Pacts and Polyhedrals
 * https://github.com/pacts-and-polyhedrals/the-ninth-school
 */

const MODULE_ID = "the-ninth-school";
const MODULE_TITLE = "The Ninth School";

// ── Init ──────────────────────────────────────────────────────────────────────
Hooks.once("init", () => {
  console.log(`${MODULE_TITLE} | Initialising v1.0.0`);
});

// ── Ready: one-time welcome notification ──────────────────────────────────────
Hooks.once("ready", () => {
  if (!game.user?.isGM) return;
  const key = `${MODULE_ID}.welcomed.v100`;
  if (game.settings.storage.get("client", key)) return;
  ui.notifications?.info(
    `${MODULE_TITLE} v1.0.0 loaded. Four compendiums available: Bestiary, Subclasses & Features, Spells, and Lore.`,
    { permanent: false }
  );
  game.settings.storage.set("client", key, "1");
});

// ── Actor sheet: Orthogenic Mark toggle (GM only) ─────────────────────────────
Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
  if (!game.user?.isGM) return;
  const actor = sheet.actor;
  if (!actor) return;

  buttons.unshift({
    label: "Orthogenic Mark",
    class: "ninth-school-orthogenic-mark",
    icon: "fas fa-seedling",
    onclick: async () => {
      const existing = actor.effects.find(
        e => e.getFlag(MODULE_ID, "orthogenicMark")
      );
      if (existing) {
        await existing.delete();
        ui.notifications?.info(
          `Orthogenic Mark removed from ${actor.name}.`
        );
      } else {
        await actor.createEmbeddedDocuments("ActiveEffect", [{
          label: "Orthogenic Mark",
          icon: `modules/${MODULE_ID}/assets/artwork/spell-icons/root-sight.png`,
          origin: MODULE_ID,
          disabled: false,
          flags: { [MODULE_ID]: { orthogenicMark: true } },
          changes: []
        }]);
        ui.notifications?.info(
          `Orthogenic Mark applied to ${actor.name}. Beasts and plants avoid them for 1d10 days.`
        );
      }
    }
  });
});

// ── Chat: intercept hidden doctrine check ─────────────────────────────────────
// When a player rolls Arcana and gets 17+, post the decoded doctrine to chat.
Hooks.on("dnd5e.rollSkill", (actor, roll, abilityId) => {
  if (abilityId !== "arc") return;
  if (roll.total < 17) return;
  // Only fire if the Eight Doors journal exists in the compendium
  const pack = game.packs.get(`${MODULE_ID}.lore`);
  if (!pack) return;
  ChatMessage.create({
    speaker: { alias: "The Manuscript Trembles" },
    content: `<div class="ninth-school-doctrine-reveal">
      <p><strong>The hidden doctrine surfaces — DC 17 Arcana achieved.</strong></p>
      <ol>
        <li><em>Contain the root.</em></li>
        <li><em>Bring the alien seed.</em></li>
        <li><em>Read the hidden pattern.</em></li>
        <li><em>Command the instinct.</em></li>
        <li><em>Burn the old growth.</em></li>
        <li><em>Dream the better form.</em></li>
        <li><em>Feed life with death.</em></li>
        <li><em>Fix the chosen shape.</em></li>
      </ol>
      <p style="color:#6b4a1a; font-style:italic;">Nature is not sacred. Nature is unfinished. Druids preserve the error. Wizards correct it.</p>
    </div>`,
    whisper: ChatMessage.getWhisperRecipients("GM")
  });
});
