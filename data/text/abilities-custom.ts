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
		desc: "If this Pokémon is Cryosect or Stalacmite, the first hit it deals 0 neutral damage. Its trap is then sprung, it changes to Revealed Form, deals damage to both foes, and loses 1/4 of its max HP",
		shortDesc:
			"Cryosect or Stalacmite: The first hit it takes is blocked, it takes 1/4 HP damage instead and damages both foes back slightly.",

		block: "  It sprung the ambush!",
		transform: "{POKEMON}'s true form was revealed!",
	},
};
