import type { Setup } from "./lang.ts";
import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import JAVASCRIPT from "npm:tree-sitter-javascript@^0.23.1";
import TYPESCRIPT from "npm:tree-sitter-typescript@^0.23.2";
import { getLangDir } from "../../../util/langdir.ts";
import { applyHighlight } from "../../treesitter-petit/highlight.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";

export const setup: Setup = async (denops: Denops, highlight: boolean) => {
  // parser
  const parser = new Parser();
  const LANGUAGE: Parser.Language = TYPESCRIPT.typescript as unknown as Parser.Language;
  parser.setLanguage(LANGUAGE);

  // query
  const JSUrl = await import.meta.resolve("npm:tree-sitter-javascript@^0.23.1");
  const JSDir = await getLangDir(JSUrl);
  const JSQueryPath = JSDir + "/queries/highlights.scm";
  const JSQuery = await Deno.readTextFile(JSQueryPath);

  const TSUrl = await import.meta.resolve("npm:tree-sitter-typescript@^0.23.2");
  const TSDir = await getLangDir(TSUrl);
  const TSQueryPath = TSDir + "/queries/highlights.scm";
  const TSQuery = await Deno.readTextFile(TSQueryPath);
  const query = new Parser.Query(LANGUAGE, JSQuery + TSQuery);
  let posnums: number[] = [];

  if (highlight) {
    denops.dispatcher = {
      ... denops.dispatcher,
      async Highlight_TYPESCRIPT() {
        // delete syntax
        await Promise.all(posnums.map((posnum) => { console.log(posnum); fn.matchdelete(denops, posnum);} ));
        posnums = await applyHighlight(denops, parser, query)
      },
    };

    await autocmd.group(denops, "Highlight_TYPESCRIPT", (helper) => {
      helper.remove("*");
      helper.define(
        ["BufEnter", "TextChanged", "TextChangedI"],
        "*",
        `if &filetype ==# 'typescript' | call denops#request("${denops.name}", "Highlight_TYPESCRIPT", []) | endif`
      );
    });

    const filetype = await fn.getbufvar(denops, "%", "&filetype");
    if (filetype === "typescript") {
      posnums = await applyHighlight(denops, parser, query)
      await denops.cmd("redraw");
    }
  }
}
