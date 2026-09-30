export const AbilitiesTextCustom: { [id: IDEntry]: AbilityText } = {
	checkmate: {
		name: "Checkmate",
		desc: "This Pokemon's Normal-type moves become Fighting-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc:
			"This Pokemon's Normal-type moves become Fighting type and have 1.2× power.",
	},
	detonate: {
		name: "Detonate",
		desc: "This Pokemon's Normal-type moves become Fire-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc:
			"This Pokemon's Normal-type moves become Fire type and have 1.2× power.",
	},
	bloodbattery: {
		name: "Blood Battery",
		shortDesc:
			"This Pokémon gains 1.3× HP from draining/Aqua Ring/Ingrain/Leech Seed/Strength Sap.",
	},
	icyambush: {
		name: "Icy Ambush",
		desc: "If this Pokémon is Cryosect or Stalacmite, it transforms into its Hidden form on entry. On being hit, it loses 1/4 of its max HP, deals damage to both foes, and loses the Hidden form. Hidden form returns if healed to max HP.",
		shortDesc:
			"Cryosect or Stalacmite: Gain Substitute-like form on entry, deal damage to foes when broken.",

		activate: "{POKEMON} is readying an ambush.",
	},
};
