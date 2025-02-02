import type { queries, Lang } from "./lang.ts";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
import { getLangDir } from "../../../util/langdir.ts";

const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
const langDir = await getLangDir(langUrl);
const highlightsQuery = await Deno.readTextFile(langDir + "/queries/highlights.scm");

const parser = new Parser();
const language: Parser.Language = C as Parser.Language;
parser.setLanguage(language);
const query: queries = {
  highlights: highlightsQuery,
};
// Lang型としてexport
const lang: Lang = {
  parser: parser,
  language: language,
  queries: query,
};

export default lang;
