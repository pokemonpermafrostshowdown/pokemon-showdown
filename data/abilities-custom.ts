export const AbilitiesCustom: import("../sim/dex-abilities").AbilityDataTable =
	{
		checkmate: {
			onModifyTypePriority: -1,
			onModifyType(move, pokemon) {
				const noModifyType = [
					"judgment",
					"multiattack",
					"naturalgift",
					"revelationdance",
					"technoblast",
					"terrainpulse",
					"weatherball",
				];
				if (
					move.type === "Normal" &&
					(!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
					!(move.isZ && move.category !== "Status") &&
					!(move.name === "Tera Blast" && pokemon.terastallized)
				) {
					move.type = "Fighting";
					move.typeChangerBoosted = this.effect;
				}
			},
			onBasePowerPriority: 23,
			onBasePower(basePower, pokemon, target, move) {
				if (move.typeChangerBoosted === this.effect)
					return this.chainModify([4915, 4096]);
			},
			flags: {},
			name: "Checkmate",
			rating: 4,
			num: 2001,
		},

		castling: {
			onFoeTryMove(target, source, move) {
				// TODO: This doesn't work, it swaps positions but doesn't change the target.
				// Also it sometimes doesn't trigger?
				if (
					this.gameType !== "doubles" ||
					target.position === source.position
				) {
					return;
				}

				const newPosition = source.position === 0 ? 1 : 0;
				this.swapPosition(source, newPosition, "[from] ability: Castling");
			},
			flags: { breakable: 1 },
			name: "Castling",
			rating: 2.5,
			num: 214,
		},

		detonate: {
			onModifyTypePriority: -1,
			onModifyType(move, pokemon) {
				const noModifyType = [
					"judgment",
					"multiattack",
					"naturalgift",
					"revelationdance",
					"technoblast",
					"terrainpulse",
					"weatherball",
				];
				if (
					move.type === "Normal" &&
					(!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
					!(move.isZ && move.category !== "Status") &&
					!(move.name === "Tera Blast" && pokemon.terastallized)
				) {
					move.type = "Fire";
					move.typeChangerBoosted = this.effect;
				}
			},
			onBasePowerPriority: 23,
			onBasePower(basePower, pokemon, target, move) {
				if (move.typeChangerBoosted === this.effect)
					return this.chainModify([4915, 4096]);
			},
			flags: {},
			name: "Detonate",
			rating: 4,
			num: 2001,
		},
	};
