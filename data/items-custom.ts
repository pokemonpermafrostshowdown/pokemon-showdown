export const ItemsCustom: import("../sim/dex-items").ItemDataTable = {
	stalacmitite: {
		name: "Stalacmitite",
		megaStone: {
			Stalacmite: "Stalacmite-Mega",
			"Stalacmite-Hidden": "Stalacmite-Mega-Hidden",
		},
		itemUser: ["Stalacmite", "Stalacmite-Hidden"],
		onTakeItem(item, source) {
			return !item.megaStone?.[source.baseSpecies.baseSpecies];
		},
		num: 2001,
	},

	plasmitite: {
		name: "Plasmitite",
		megaStone: { Plasmite: "Plasmite-Mega" },
		itemUser: ["Plasmite"],
		onTakeItem(item, source) {
			return !item.megaStone?.[source.baseSpecies.baseSpecies];
		},
		num: 2002,
	},

	thermmitite: {
		name: "Thermmitite",
		megaStone: { Thermmite: "Thermmite-Mega" },
		itemUser: ["Plasmite"],
		onTakeItem(item, source) {
			return !item.megaStone?.[source.baseSpecies.baseSpecies];
		},
		num: 2003,
	},
};
