import type { Setup } from "./lang.ts";
import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
import { getLangDir } from "../../util/langdir.ts";
import { applyHighlight } from "../treesitter-petit/highlight.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";

//この関数をSetupとしてexportしたい
export const setup: Setup = async (denops: Denops, highlight: boolean) => {
  // parser
  const parser = new Parser();
  parser.setLanguage(C as unknown as Parser.Language);

  // query
  const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
  const langDir = await getLangDir(langUrl);
  const highlightsQueryPath = langDir + "/queries/highlights.scm";
  const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);
  const query = new Parser.Query(C as unknown as Parser.Language, highlightsQuery);
  let posnums: number[] = [];

  if (highlight) {
    denops.dispatcher = {
      ... denops.dispatcher,
      async Highlight_C() {
        // delete syntax
        await Promise.all(posnums.map((posnum) => { console.log(posnum); fn.matchdelete(denops, posnum);} ));
        posnums = await applyHighlight(denops, parser, query)
      },
    };

    await autocmd.group(denops, "Highlight_C", (helper) => {
      helper.remove("*");
      helper.define(
        ["BufEnter", "TextChanged", "TextChangedI"],
        "*",
        `if &filetype ==# 'c' | call denops#request("${denops.name}", "Highlight_C", []) | endif`
      );
    });

    const filetype = await fn.getbufvar(denops, "%", "&filetype");
    if (filetype === "c") {
      posnums = await applyHighlight(denops, parser, query)
      await denops.cmd("redraw");
    }
  }
}
