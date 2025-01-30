import type { Setup } from "./lang.ts";
import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
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
  const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
  const langDir = await getLangDir(langUrl);
  const highlightsQueryPath = langDir + "/queries/highlights.scm";
  const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);
  const query = new Parser.Query(LANGUAGE, highlightsQuery);

  if (highlight) {
    denops.dispatcher = {
      ... denops.dispatcher,
      async Highlight_C() {
        // buffer変数のposnumberを取得
        const posnumbers = await fn.getbufvar(denops, "%", "petit_posnum") as string;
        //posnumbersがなければconsole.log
        if (posnumbers !== "") {
          // posnumbersをnumber[]に変換
          const posnums = posnumbers.split(",").map((posnum) => parseInt(posnum));
          // delete syntax
          await Promise.all(posnums.map((posnum) => { console.log(posnum); fn.matchdelete(denops, posnum);} ));
        }
        const result = await applyHighlight(denops, parser, query)
        // buffer変数にposnumberを保存
        await fn.setbufvar(denops, "%", "petit_posnum", result.join(","));
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
      const result = await applyHighlight(denops, parser, query)
      await fn.setbufvar(denops, "%", "petit_posnum", result.join(","));
      await denops.cmd("redraw");
    }
  }
}
