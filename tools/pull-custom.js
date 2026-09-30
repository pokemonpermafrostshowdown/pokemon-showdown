// @ts-check
/* eslint-disable @stylistic/arrow-parens */

const config = require("../config/config");
const { google } = require("googleapis");
const { inspect } = require("node:util");
const { writeFile } = require("node:fs/promises");

const { toID } = /** @type {import("../sim/dex-data")} */ (
	require("../dist/sim/dex-data")
);

const GEN = 9;
const NUM_OFFSET = 2000;

/**
 * @typedef {import("../sim/dex-species").SpeciesData} SpeciesDataImmut
 * @typedef {{ -readonly [K in keyof SpeciesDataImmut]: SpeciesDataImmut[K] }} SpeciesData
 * @typedef {{
 * 	id: string,
 *  cellName: string;
 *  species: SpeciesData,
 * }} SpeciesRow
 * @typedef {{
 *  rows: SpeciesRow[];
 *  byId: Map<string, SpeciesRow>;
 * 	byNum: Map<number, SpeciesRow[]>;
 *  byCellName: Map<string, SpeciesRow>;
 * }} SpeciesRowCollection
 */

(async () => {
	const auth = new google.auth.OAuth2(
		config.pullcustom.auth.clientId,
		config.pullcustom.auth.clientSecret
	);
	auth.setCredentials({
		refresh_token: config.pullcustom.auth.refreshToken,
	});

	const sheets = google.sheets({ version: "v4", auth });

	const [speciesRows, cellNamesToLearnsetData] = await Promise.all([
		readSpeciesRows(sheets),
		readMovesetToLearnsetData(sheets),
	]);

	/** @type {import("../sim/dex-species").SpeciesDataTable} */
	const dataPokedex = {};
	/** @type {import("../sim/dex-species").LearnsetDataTable} */
	const dataLearnsets = {};
	/** @type {import("../sim/dex-species").SpeciesFormatsDataTable} */
	const dataFormats = {};

	for (const speciesRow of speciesRows.rows) {
		dataPokedex[speciesRow.id] = speciesRow.species;
		dataFormats[speciesRow.id] = { tier: "OU", doublesTier: "DOU" };

		const learnset = cellNamesToLearnsetData.get(speciesRow.cellName);
		if (learnset) {
			dataLearnsets[speciesRow.id] = learnset;
		} else {
			console.warn(`No learnset for ${speciesRow.cellName}, using default.`);
			dataLearnsets[speciesRow.id] = { learnset: { tackle: [`${GEN}L1`] } };
		}
	}

	const dataPokedexText = `
		export const Pokedex: import("../sim/dex-species").SpeciesDataTable =
			${inspect(dataPokedex, { depth: null })}
		;
	`;

	const dataLearnsetsText = `
		export const Learnsets: import("../sim/dex-species").LearnsetDataTable =
			${inspect(dataLearnsets, { depth: null })}
		;
	`;

	const dataFormatsText = `
		export const FormatsData: import("../sim/dex-species").SpeciesFormatsDataTable =
			${inspect(dataFormats, { depth: null })}
		;
	`;

	await Promise.all([
		writeFile(`${__dirname}/../data/pokedex.ts`, dataPokedexText),
		writeFile(`${__dirname}/../data/learnsets.ts`, dataLearnsetsText),
		writeFile(`${__dirname}/../data/formats-data.ts`, dataFormatsText),
	]);
})();

/* -------------------------------------------------------------------------- */
/*                                   Species                                  */
/* -------------------------------------------------------------------------- */

/**
 * @param {import("googleapis").sheets_v4.Sheets} sheets
 */
async function readSpeciesRows(sheets) {
	/** @type {SpeciesRowCollection} */
	const collection = {
		rows: [],
		byId: new Map(),
		byNum: new Map(),
		byCellName: new Map(),
	};

	const response = await sheets.spreadsheets.get({
		spreadsheetId: config.pullcustom.spreadsheets.fakemon,
		ranges: ["Dex!A2:ZZ1000"],
		includeGridData: true,
	});

	const rawRows = response.data.sheets?.[0].data?.[0]?.rowData;
	if (!rawRows) throw new Error("No fakemon rows.");

	for (const rawRow of rawRows) {
		if (!rawRow.values) continue;

		const name = rawRow.values[1].userEnteredValue?.stringValue;
		if (!name) break;

		const result = readSpeciesRow(
			name,
			rawRow.values,
			(num) => !collection.byNum.has(num)
		);
		if (!result.ok) {
			console.warn(`Skipping ${name} (${result.reason}).`);
			continue;
		}

		const { row } = result;

		collection.rows.push(row);
		collection.byId.set(row.id, row);
		collection.byCellName.set(row.cellName, row);

		const byNum = collection.byNum.get(row.species.num);
		if (byNum) {
			byNum.push(row);
		} else {
			collection.byNum.set(row.species.num, [row]);
		}
	}

	return collection;
}

const FORM_NAME_TRANSFORMS = {
	Male: "M",
	Female: "F",
};

/**
 * @param {string} cellName
 * @param {import("googleapis").sheets_v4.Schema$CellData[]} values
 * @param {(num: number) => boolean} isFirstOfNum
 * @returns {{ ok: true, row: SpeciesRow } | { ok: false, reason: string }}
 */
function readSpeciesRow(cellName, values, isFirstOfNum) {
	let num = values[0].userEnteredValue?.numberValue;
	if (!num) return { ok: false, reason: "bad number" };
	num += NUM_OFFSET;

	/** @type {string} */
	let id, name;
	/** @type {string | undefined} */
	let form;
	const nameWithFormMatch = /^(.*) \(([^()]*)\)$/.exec(cellName);
	if (nameWithFormMatch) {
		name = nameWithFormMatch[1];
		form = nameWithFormMatch[2];
	} else {
		name = cellName;
	}

	if (form && form in FORM_NAME_TRANSFORMS) {
		form = FORM_NAME_TRANSFORMS[form];
	}

	const isFirstForm = !!form && isFirstOfNum(num);
	if (form && !isFirstForm) {
		id = toID(name + form);
		name += "-" + form;
	} else {
		id = toID(name);
	}

	const type1 = values[2].note;
	if (!type1) return { ok: false, reason: "no type1" };
	const type2 = values[3].note || undefined;
	const types = type2 ? [type1, type2] : [type1];

	const ability1 = readNoteOrStringValue(values[6]);
	if (!ability1) return { ok: false, reason: "no ability1" };
	const ability2 = readNoteOrStringValue(values[7]);
	const abilityH = readNoteOrStringValue(values[8]);
	const abilities = { 0: ability1 };
	if (ability2) abilities[1] = ability2;
	if (abilityH) abilities["H"] = abilityH;

	const hp = values[9].userEnteredValue?.numberValue;
	if (!hp) return { ok: false, reason: "no hp" };
	const atk = values[10].userEnteredValue?.numberValue;
	if (!atk) return { ok: false, reason: "no atk" };
	const def = values[11].userEnteredValue?.numberValue;
	if (!def) return { ok: false, reason: "no def" };
	const spa = values[12].userEnteredValue?.numberValue;
	if (!spa) return { ok: false, reason: "no spa" };
	const spd = values[13].userEnteredValue?.numberValue;
	if (!spd) return { ok: false, reason: "no spd" };
	const spe = values[14].userEnteredValue?.numberValue;
	if (!spe) return { ok: false, reason: "no spe" };
	const baseStats = { hp, atk, def, spa, spd, spe };

	const genderRatio = values[21].userEnteredValue?.stringValue;
	// prettier-ignore
	const gender =
		genderRatio === "All M" ? "M" :
		genderRatio === "All F" ? "F" :
		genderRatio === "None" ? "N" :
		undefined;

	const eggGroup1 = values[22].userEnteredValue?.stringValue;
	if (!eggGroup1) return { ok: false, reason: "no eggGroup1" };
	const eggGroup2 = values[23].userEnteredValue?.stringValue;
	const eggGroups = eggGroup2 ? [eggGroup1, eggGroup2] : [eggGroup1];

	const heightm = values[25].userEnteredValue?.numberValue;
	if (!heightm) return { ok: false, reason: "no height" };

	const weightkg = values[26].userEnteredValue?.numberValue;
	if (!weightkg) return { ok: false, reason: "no weight" };

	/** @type {SpeciesRow['species']} */
	const species = {
		num,
		gen: GEN,
		name,
		types,
		abilities,
		baseStats,
		heightm,
		weightkg,
		eggGroups,
	};

	if (form) {
		species[isFirstForm ? "baseForme" : "forme"] = form;
	}
	if (gender) {
		species.gender = gender;
	}

	return { ok: true, row: { id, cellName, species } };
}

/* -------------------------------------------------------------------------- */
/*                                  Movesets                                  */
/* -------------------------------------------------------------------------- */

/**
 * @param {import("googleapis").sheets_v4.Sheets} sheets
 */
async function readMovesetToLearnsetData(sheets) {
	/** @type {Map<string, import("../sim/dex-species").LearnsetData>} */
	const cellNameToLearnset = new Map();

	const response = await sheets.spreadsheets.get({
		spreadsheetId: config.pullcustom.spreadsheets.movesets,
		ranges: ["Movesets!A2:ZZ1000"],
		includeGridData: true,
	});

	const rawRows = response.data.sheets?.[0].data?.[0]?.rowData;
	if (!rawRows) throw new Error("No moveset rows.");

	for (const rawRow of rawRows) {
		if (!rawRow.values) continue;

		const monCellName = readNoteOrStringValue(rawRow.values[0]);
		if (!monCellName) break;

		const moveName = readNoteOrStringValue(rawRow.values[1]);
		if (!moveName) break;

		const moveId = toID(moveName);
		const method = rawRow.values[2].userEnteredValue?.stringValue;

		/** @type {import("../sim/dex-species").MoveSource} */
		let source;

		// prettier-ignore
		switch (method) {
		case "Level": {
			const level = rawRow.values[3].userEnteredValue?.numberValue;
			if (!level) throw new Error(`Invalid level for move ${moveName}.`);

			source = `${GEN}L${level}`;
			break;
		}
		case "Evolve": {
			source = "9L1";
			break;
		}
		default: {
			throw new Error(`Invalid learn method ${method} for move ${moveName}.`);
		}
		}

		const learnset = cellNameToLearnset.get(monCellName);
		if (learnset) {
			learnset.learnset ??= {};
			learnset.learnset[moveId] = [source];
		} else {
			cellNameToLearnset.set(monCellName, {
				learnset: { [moveId]: [source] },
			});
		}
	}

	return cellNameToLearnset;
}

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

/**
 * @param {import("googleapis").sheets_v4.Schema$CellData} cell
 */
function readNoteOrStringValue(cell) {
	return cell.note || cell.userEnteredValue?.stringValue;
}
