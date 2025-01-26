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
      const promises: Record<string, Array<Promise<number | undefined>>> = {
        "tsFunction": [],
        "tsNumber": [],
        "tsKeyword": [],
        "tsString": [],
        "tsComment": [],
      };

      for (const match of matches) {
        for (const capture of match.captures) {
          const getpos = async (capture: Parser.QueryCapture, captureName: string, highlightName: string): Promise<number | undefined> => {
            console.debug(capture.name);
            if (capture.name === captureName) {
              return await fn.matchaddpos(
                denops,
                highlightName,
                [[
                  capture.node.startPosition.row + 1,
                  capture.node.startPosition.column + 1,
                  capture.node.endPosition.column - capture.node.startPosition.column,
                ]],
              );
            }
          }

          promises["tsComment"].push(getpos(capture, "comment", "tsComment"));
          promises["tsString"].push(getpos(capture, "string", "tsString"));
          promises["tsKeyword"].push(getpos(capture, "keyword", "tsKeyword"));
          promises["tsNumber"].push(getpos(capture, "number", "tsNumber"));
          promises["tsFunction"].push(getpos(capture, "function", "tsFunction"));
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
