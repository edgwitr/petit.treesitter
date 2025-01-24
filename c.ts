import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
import { getLangDir } from "./langdir.ts";
import { makeEdit } from "./parser_edit.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";


// cの関数
export async function csetup(denops: Denops): Promise<void> {
  const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
  const langDir = await getLangDir(langUrl);

  // ハイライト用のクエリを読み込み
  const highlightsQueryPath = langDir + "/queries/highlights.scm";
  const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);

  const parser = new Parser();
  parser.setLanguage(C as unknown as Parser.Language);

  denops.dispatcher = {
    ... denops.dispatcher,
    async onEnterCBuffer(): Promise<void> {
      // cのバッファでなければ早期リターン
      const filetype = await fn.getbufvar(denops, "%", "&filetype") as string;
      if (filetype !== "c") {
        return;
      }
      console.log("read");
      const lines = await fn.getline(denops, 1, "$");
      // buffer変数にlinesを代入
      await fn.setbufvar(denops, "%", "lines", lines);

      let tree = parser.parse(lines.join("\n"));
      const query = new Parser.Query(C as unknown as Parser.Language, highlightsQuery);
      let matches = query.matches(tree.rootNode);
      for (const match of matches) {
        // console.log(`Pattern: ${match.pattern}`);
        for (const capture of match.captures) {
          // ノードがfunctionだったらハイライトグループとしてFunctionを付与
          if (capture.name === "function") {
            await fn.matchaddpos(
              denops,
              "tsFunction",
              [[
                capture.node.startPosition.row + 1,
                capture.node.startPosition.column + 1,
                capture.node.endPosition.column - capture.node.startPosition.column,
              ]],
            );
          // console.log(`  Capture Name: ${capture.name}`);
          // console.log(`  Node Type: ${capture.node.type}`);
          // console.log(`  Start Pos: (${capture.node.startPosition.row}, ${capture.node.startPosition.column})`);
          // console.log(`  End Pos:   (${capture.node.endPosition.row}, ${capture.node.endPosition.column})`);

          }
        }
      }
      // 画面をリロード
      await denops.cmd("redraw");
    },
  };

  await autocmd.group(denops, "test", (helper) => {
    helper.remove("*");
    helper.define(
      "Filetype",
      "c",
      `call denops#request("${denops.name}", "onEnterCBuffer", [])`
    );
  });
  // 既に開いているバッファに対してFiletypeイベントを発火
  await denops.cmd("doautocmd Filetype c");
}
