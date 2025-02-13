import type { Setup } from "./lang.ts";
import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-cpp@^0.23.4";
import { getLangDir } from "../../../util/langdir.ts";
import { applyHighlight } from "../../treesitter-petit/highlight.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";

export const setup: Setup = async (denops: Denops, highlight: boolean) => {
  // parser
  const parser = new Parser();
  const LANGUAGE: Parser.Language = C as unknown as Parser.Language;
  parser.setLanguage(LANGUAGE);

  // query
  const langUrl = await import.meta.resolve("npm:tree-sitter-cpp@^0.23.4");
  const langDir = await getLangDir(langUrl);
  const highlightsQueryPath = langDir + "/queries/highlights.scm";
  const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);
  const query = new Parser.Query(LANGUAGE, highlightsQuery);
  let posnums: number[] = [];

  if (highlight) {
    denops.dispatcher = {
      ... denops.dispatcher,
      async Highlight_CPP() {
        // delete syntax
        await Promise.all(posnums.map((posnum) => { console.log(posnum); fn.matchdelete(denops, posnum);} ));
        posnums = await applyHighlight(denops, parser, query)
      },
    };

    await autocmd.group(denops, "Highlight_CPP", (helper) => {
      helper.remove("*");
      helper.define(
        ["BufEnter", "TextChanged", "TextChangedI"],
        "*",
        `if &filetype ==# 'cpp' | call denops#request("${denops.name}", "Highlight_CPP", []) | endif`
      );
    });

    const filetype = await fn.getbufvar(denops, "%", "&filetype");
    if (filetype === "cpp") {
      posnums = await applyHighlight(denops, parser, query)
      await denops.cmd("redraw");
    }
  }
}
