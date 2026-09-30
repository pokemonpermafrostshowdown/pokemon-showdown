export const Scripts: ModdedBattleScriptsData = {
	gen: 9,
	actions: {
		canTerastallize() {
			return null;
		},
		canMegaEvo(pokemon) {
			const species = pokemon.baseSpecies;
			const item = pokemon.getItem();
			return item.megaStone?.[species.name] || null;
		},
	},
};
