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
			num: 2003,
		},

		bloodbattery: {
			onTryHealPriority: 1,
			onTryHeal(damage, target, source, effect) {
				const heals = [
					"drain",
					"leechseed",
					"ingrain",
					"aquaring",
					"strengthsap",
				];
				if (heals.includes(effect.id)) {
					return this.chainModify([5324, 4096]);
				}
			},
			flags: {},
			name: "Blood Battery",
			rating: 3,
			num: 2004,
		},

		icyambush: {
			onDamagePriority: 1,
			onDamage(damage, target, source, effect) {
				if (
					effect?.effectType === "Move" &&
					["cryosect", "stalacmite", "stalacmitemega"].includes(
						target.species.id
					)
				) {
					this.add("-activate", target, "ability: Icy Ambush");
					this.effectState.busted = true;
					return 0;
				}
			},
			onCriticalHit(target, source, move) {
				if (!target) return;
				if (
					!["cryosect", "stalacmite", "stalacmitemega"].includes(
						target.species.id
					)
				) {
					return;
				}
				const hitSub =
					target.volatiles["substitute"] &&
					!move.flags["bypasssub"] &&
					!(move.infiltrates && this.gen >= 6);
				if (hitSub) return;

				if (!target.runImmunity(move)) return;
				return false;
			},
			onEffectiveness(typeMod, target, type, move) {
				if (!target || move.category === "Status") return;
				if (
					!["cryosect", "stalacmite", "stalacmitemega"].includes(
						target.species.id
					)
				) {
					return;
				}

				const hitSub =
					target.volatiles["substitute"] &&
					!move.flags["bypasssub"] &&
					!(move.infiltrates && this.gen >= 6);
				if (hitSub) return;

				if (!target.runImmunity(move)) return;
				return 0;
			},
			onUpdate(pokemon) {
				if (
					["cryosect", "stalacmite", "stalacmitemega"].includes(
						pokemon.species.id
					) &&
					this.effectState.busted
				) {
					const newSpecies = pokemon.species.name + "-Revealed";
					pokemon.formeChange(newSpecies, this.effect, true);
					this.damage(
						pokemon.baseMaxhp / 8,
						pokemon,
						pokemon,
						this.dex.species.get(newSpecies)
					);
				}
			},
			flags: {
				failroleplay: 1,
				noreceiver: 1,
				noentrain: 1,
				notrace: 1,
				failskillswap: 1,
				cantsuppress: 1,
				breakable: 1,
				notransform: 1,
			},
			name: "Icy Ambush",
			rating: 3,
			num: 2005,
		},
	};
