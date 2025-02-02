import type { queries, Lang } from "./lang.ts";
import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
import { getLangDir } from "../../../util/langdir.ts";
import { applyHighlight, deleteHighlight } from "../../treesitter-petit/highlight.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";


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
export const lang: Lang = {
  parser: parser,
  language: language,
  queries: query,
};

// export const setup: Setup = async (denops: Denops, highlight: boolean) => {
//   // parser
//   const parser = new Parser();
//   const LANGUAGE: Parser.Language = C as unknown as Parser.Language;
//   parser.setLanguage(LANGUAGE);

//   // query
//   const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
//   const langDir = await getLangDir(langUrl);
//   const highlightsQueryPath = langDir + "/queries/highlights.scm";
//   const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);
//   const query = new Parser.Query(LANGUAGE, highlightsQuery);

//   if (highlight) {
//     denops.dispatcher = {
//       ... denops.dispatcher,
//       async Highlight_C(asdf: string) {
//         await deleteHighlight(denops, await fn.win_getid(denops), await fn.bufnr(denops));
//         await applyHighlight(denops, parser, query)
//       },
//     };

//     await autocmd.group(denops, "Highlight_C", (helper) => {
//       helper.remove("*");
//       helper.define(
//         ["BufEnter", "TextChanged", "TextChangedI"],
//         "*",
//         `if &filetype ==# 'c' | call denops#request("${denops.name}", "Highlight_C", []) | endif`
//       );
//     });

//     const filetype = await fn.getbufvar(denops, "%", "&filetype");
//     if (filetype === "c") {
//       await applyHighlight(denops, parser, query)
//       await denops.cmd("redraw");
//     }
//   }
// }
