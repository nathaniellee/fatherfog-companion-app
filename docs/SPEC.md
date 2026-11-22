# Fatherfog 0e — Domain & Application Specification

## 1. Core Attributes & Derived State
- **Stats (3):** `strength`, `intellect`, `will` — each rolled `6d10` (`6–60` base) before class modifiers.
- **Saves (3):** `body`, `mind`, `spirit` — each rolled `5d10` (`5–50` base) before class modifiers.
- **Health:**
  - `maxHealth` = final `strength` (after class modifiers).
  - `currentHealth` initialized to `maxHealth`.
- **Hope:**
  - `maxHope` = `100` (modified by specific Coin Stories, Legacy Artifacts, or Despair results).
  - `currentHope` initialized to `maxHope`.
- **Defense:**
  - Integer initialized to `0`.
  - Automatically derived from equipped gear: `Leather` (`+1`), `Shield` (`+2`), `Chain` (`+3`), `Plate` (`+5`), `Staff` (`+1`), `Lion Cape` (`+5`), `Aegis Armor` (`+5`), plus `+1` when wielding an off-hand one-handed melee weapon (only available when owning $\ge 2$ one-handed melee weapons and no Shield or two-handed Great Weapon is equipped).
- **Consumables (First-Class Fields):**
  - `rations: number` (initialized to `0`; incremented by Rucksack grants and `Dried Meal` purchases; never listed as a generic row in `inventory`).
  - `waterskin: { owned: boolean; filled: boolean }` (updated when `Waterskin` is acquired or toggled on the sheet).
- **Coin:**
  - `coin: number` (can be negative, e.g., `-99` from Coin Story `99`).

---

## 2. Classes (4)
Each class applies stat/save modifiers, grants static and/or player-selected starting skills, grants a starting Skill Point pool, displays passive Class Traits, and maps to 3 eligible Rucksacks (`Exploration` is shared by all four classes, plus 2 unique rucksacks per class):

- **The Worker**
  - **Modifiers:** `Strength +10`, `Body +5`, `Mind +5`, `Spirit +5`
  - **Starting Skills:** `Tinkering` (fixed) + **Choose 1:** `Alchemy` OR `Boating`
  - **Starting Skill Points:** `10`
  - **Class Traits:** Display descriptive Worker class traits from 0e rules.
  - **Eligible Rucksacks:** `Excavation`, `Exertion`, `Exploration`

- **The Philosopher**
  - **Modifiers:** `Intellect +10`, `Mind +5`
  - **Starting Skills:** `Literacy` (fixed) + **Choose 1:** `Basic Care` OR `Alchemy` + **Choose 1:** `Knowledge` OR `Perception`
  - **Starting Skill Points:** `7`
  - **Class Traits:** *Rational* and *Loss of Reason*
  - **Eligible Rucksacks:** `Examination`, `Experimentation`, `Exploration`

- **The Stranger**
  - **Modifiers:** `Intellect +5`, `Will +5`, `Mind +40`, `Body -10`, `Spirit -10`
  - **Starting Skills:** `Foglore` (fixed), `Fog Vision` (fixed)
  - **Starting Skill Points:** `5`
  - **Class Traits:** *Odd Presence* (non-Stranger party members lose 2 Hope when touching or waking up in the Stranger's presence)
  - **Eligible Rucksacks:** `Extraction`, `Excommunication`, `Exploration`

- **The Hunter**
  - **Modifiers:** `Will +10`, `Body +5`, `Spirit +10`
  - **Starting Skills:** **Choose 1:** `Archery` OR `Firearms` + **Choose 1:** `Hiding` OR `Animals`
  - **Starting Skill Points:** `5`
  - **Class Traits:** *Thrill of the Hunt* and *Falling Prey*
  - **Eligible Rucksacks:** `Extermination`, `Exhibition`, `Exploration`

---

## 3. Rucksacks & Equipment Catalog
- **9 Class-Mapped Rucksacks (3 per class):**
  - `Excavation`, `Exertion`, `Exploration`, `Examination`, `Experimentation`, `Extraction`, `Excommunication`, `Extermination`, `Exhibition`.
  - **Double-Duty Manifests:** Each Rucksack entry provides a `displayLabel` for selection cards AND a typed grant (`catalogItemId`, `quantity: number | { count: number; sides: number }`, `customName?`, or `grantRations?: number`).
  - Examples of `customName` mappings onto canonical catalog items:
    - *Exertion:* `Great Weapon` $\rightarrow$ `customName: "Great Hammer"`
    - *Extermination:* `Hand Weapon` $\rightarrow$ `customName: "Short Sword"`, `Arrows` (`2d10`), `Leather` armor
    - *Exhibition:* `Hand Weapon` $\rightarrow$ `customName: "Rapier"`, `Powder Shot` (`1d10`)
    - *Experimentation:* `Tomes of Knowledge` (`3`) — standard narrative inventory item, no creation-time prompt.
- **Equipment Catalog (`src/domain/data/equipment.ts`):**
  - Covers General Equipment (35 items), Melee Weapons (9 items), Defensive Gear (5 items — `(Off-Hand Weapon)` is NOT a catalog item), and Ranged Weapons (12 items).
  - Players can customize the display name (`customName`) of any weapon/gear item upon purchase or in inventory.
  - **Scarcity & Honor-System Shop:** Tiers: Plentiful (`98%`), Common (`80%`), Scarce (`60%`), Rare (`40%`), Very Rare (`20%`), Unheard of (`1%`). Purchasing rolls `d100` against `availabilityPercent`. If unavailable, display the failed roll alongside a **"Purchase Anyway (Guide Override)"** button.

---

## 4. Flavor, Coin & Legacy Artifact Tables (0-Indexed: `0–9` / `0–99`)
- **Cloak Color (`d10`, `0–9`):** Player may **Roll d10** or manually choose any of the 10 colors (`Black`, `Red`, `Orange`, `Yellow`, `Green`, `Blue`, `Purple`, `Grey`, `White`, `Brown`).
- **Brooches (`d100`, `0–99`):** Player may **Roll d100** or manually pick/search from all 100 entries.
- **Trinkets (`d100`, `0–99`):** Player may **Roll d100** or manually pick/search from all 100 entries.
- **Coin Stories (`d100`, `0–99` — STRICTLY ROLL-ONLY):**
  - No manual selection allowed.
  - Mechanical side effects:
    - `1` (`1c`): `+5` Skill Points.
    - `2–10`: Grants a specific Common skill (`Hiding`, `Literacy`, `Alchemy`, `Fishing`, `Animals`, `Performance`, `Fighting`, `Art`, `Tinkering`). **Duplicate Guard:** If the character already owns the granted skill, `rollCoinStory` silently re-rolls until a non-duplicate result is obtained.
    - `69` (`99c`): `-5` `maxHope` (sets `maxHope` and `currentHope` to `95`).
    - `99` (`-99c`): Sets starting `coin` to `-99`.
- **Legacy Artifacts (`d100`, `0–99` — Opt-In & Secret):**
  - Not rolled automatically for every character; surfaced via an opt-in **"Eligible for Starting Legacy Artifact (First Character / Guide Grant)"** action.
  - Masked behind a **"Tap to Reveal (Secret)"** toggle on the sheet to prevent table shoulder-surfing, and flagged `isSecret: true` for future communal views.
  - Mechanical hooks: `31. Gran Gran's Grimoire` grants `Cooking`; `40. Lion Cape` (`+5 Defense`); `55. The Dangling Shortsword of Damocles` (`-10 maxHope`); `84. Aegis Armor` (`+5 Defense`).

---

## 5. Skills & Prerequisite Graph (56 Skills)
- **Ranks & Target Bonuses:** `common` (`+10`), `expert` (`+15`), `master` (`+20`).
- **Cost:** Flat **`5` Skill Points** per purchase across all ranks.
- **Authoritative Sheet Graph (`src/domain/data/skills.ts`):**
  - **Common (`+10`, `prerequisites: []`) — 20 skills:** `Tinkering`, `Art`, `Knowledge`, `Athletics`, `Foglore`, `Boating`, `Riding`, `Animals`, `Basic Care` *(Common +10 per sheet)*, `Foraging`, `Alchemy`, `Fighting`, `Archery`, `Firearms`, `Throwing`, `Hiding`, `Performance`, `Fishing`, `Literacy`, `Perception`.
  - **Expert (`+15`, OR-logic prerequisites) — 22 skills:**
    - `Trade Specialty` *(custom)* $\leftarrow$ `Tinkering`
    - `Smithing` $\leftarrow$ `Tinkering`
    - `Art Specialty` *(custom)* $\leftarrow$ `Art`
    - `Mysticism` $\leftarrow$ `Knowledge`
    - `Athletic Specialty` *(custom)* $\leftarrow$ `Athletics`
    - `Fog Vision` $\leftarrow$ `Foglore`
    - `Piloting` $\leftarrow$ `Boating`
    - `Trick Riding` $\leftarrow$ `Riding`
    - `Animal Specialty` *(custom)* $\leftarrow$ `Animals`
    - `Anatomy` $\leftarrow$ `Basic Care`
    - `Botany` $\leftarrow$ `Basic Care` **OR** `Foraging`
    - `Explosives` $\leftarrow$ `Alchemy`
    - `Unarmed Combat` $\leftarrow$ `Fighting`
    - `Navigation` $\leftarrow$ `[]` *(no prerequisite)*
    - `Weapon Specialty` *(custom)* $\leftarrow$ `Fighting` **OR** `Archery` **OR** `Firearms` **OR** `Throwing`
    - `Sleight of Hand` $\leftarrow$ `[]` *(no prerequisite)*
    - `Sneaking` $\leftarrow$ `Hiding`
    - `Performance Specialty` *(custom)* $\leftarrow$ `Performance`
    - `Disguise` $\leftarrow$ `Performance`
    - `Language` $\leftarrow$ `Literacy`
    - `Understanding` $\leftarrow$ `Perception`
    - `Tracking` $\leftarrow$ `Perception`
  - **Master (`+20`, OR-logic prerequisites) — 14 skills:**
    - `Forge Specialty` *(custom)* $\leftarrow$ `Smithing`
    - `Fog Whispers` $\leftarrow$ `Fog Vision`
    - `Lock Picking` $\leftarrow$ `[]` *(no prerequisite)*
    - `Command Specialty` *(custom)* $\leftarrow$ `Piloting` **OR** `Trick Riding`
    - `Animal Familiar` *(custom)* $\leftarrow$ `Animal Specialty`
    - `Surgery` $\leftarrow$ `Anatomy`
    - `Medicine` $\leftarrow$ `Botany`
    - `Cartography` $\leftarrow$ `Navigation`
    - `Weapon Mastery` *(custom)* $\leftarrow$ `Weapon Specialty`
    - `Cooking` $\leftarrow$ `[]` *(no prerequisite)*
    - `Pickpocketing` $\leftarrow$ `Sleight of Hand` **OR** `Sneaking`
    - `Persuasion` $\leftarrow$ `Disguise` **OR** `Language`
    - `Language Specialty` *(custom)* $\leftarrow$ `Language`
    - `Hypervigilance` $\leftarrow$ `Understanding` **OR** `Tracking`
- **Customizable Skills:** Skills ending in `Specialty`, `Mastery`, or `Familiar` require a user-entered string (e.g., `"Handaxe"` $\rightarrow$ `"Handaxe Specialty"` / `"Handaxe Mastery"`, `"Squirrel"` $\rightarrow$ `"Squirrel Familiar"`). Characters may acquire the same customizable skill multiple times with distinct custom labels.
- **Excluded:** `Unnatural Ability` is omitted from the deterministic skill tree (tracked via freeform character notes).

---

## 6. Panic Engine Dice Roller, Hope/Despair & Death Saves
- **Roll View Primary Buttons:** `Stat` | `Save` | `Hope` (plus `Death Save` surfaced when `currentHealth === 0` or from the Roll drawer).
- **Stat & Save Roll Drawer UX:**
  - Single-select **Stat** (`Strength` / `Intellect` / `Will`) or **Save** (`Body` / `Mind` / `Spirit`).
  - Optional exclusive single-select **Owned Skill** (`+10` / `+15` / `+20`).
  - Optional exclusive single-select **Modifier**: `Advantage [+]` (roll `2d100`, take lowest) or `Disadvantage [-]` (roll `2d100`, take highest).
  - **Success:** `roll < targetNumber` (doubles `00–99` = Critical Success; `00` always succeeds).
  - **Failure:** `roll >= targetNumber` (doubles `00–99` = Critical Failure; `99` always fails).
- **Automatic Hope Loss & Chained Hope Saves:**
  - Failing any **Stat Check** or **Save** automatically subtracts `1` from `currentHope` (clamped at `0`).
  - **Auto Hope Save Triggers:**
    1. Rolling a **Critical Failure** on a Stat Check or Save (never chained off a Hope Save itself).
    2. `currentHope` reaching `0`.
- **Hope Save (`d100 < currentHope`):**
  - On **Failure** (`roll >= currentHope`): Set `currentHope = Math.min(maxHope, Math.max(currentHope, roll))` and resolve the matching `0–99` **Despair Table** entry (logging quoted titles like `"Clutching Ritual"` as active lasting conditions on the sheet).
- **Death Save (Body Save at `currentHealth === 0`):**
  - On **Failure**: Display **Dead** banner (do not lock or wipe the sheet).
  - On **Success** (`roll < targetNumber`): Set `currentHealth = Math.min(maxHealth, roll)` (or full Health + Hope on `0 — Rebirth`) and resolve the matching `0–74` **Death Table** entry.
  