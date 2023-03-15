const { NerManager } = require("node-nlp");
const {
  mallwareData,
  organisationsData,
  osData,
  hackersGroupsData,
} = require("../config/trainData");

// interface Entitiy {
//   start: number;
//   end: number;
//   len: number;
//   levenshtein: number;
//   accuracy: number;
//   option: string;
//   sourceText: string;
//   entity: string;
//   utteranceText: string;
// }

const manager = new NerManager({ threshold: 0.8, builtinWhitelist: [] });

manager.addNamedEntityText("MALWARE", "default", ["en"], mallwareData);

manager.addNamedEntityText(
  "HACKER_GROUPS",
  "default",
  ["en"],
  hackersGroupsData
);

manager.addNamedEntityText(
  "ORGANISATIONS",
  "default",
  ["en"],
  organisationsData
);

manager.addNamedEntityText("OS", "default", ["en"], osData);

const nlpManager = async (text) => {
  try {
    const entities = await manager.findEntities(text, "en");
    return entities;
  } catch (error) {
    console.log(error);
    return [];
  }
};

module.exports = { nlpManager };
