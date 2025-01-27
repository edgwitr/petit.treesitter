import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
import { getLangDir } from "./langdir.ts";
import { makeEdit } from "./parser_edit.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";

const applySyntaxHighlight = async (denops: Denops, parser: Parser, query: Parser.Query): Promise<(number | undefined)[]> => {
  const lines = await fn.getline(denops, 1, "$");
  const tree = parser.parse(lines.join("\n"));
  const matches = query.matches(tree.rootNode);
  // // buffer変数にlinesを代入
  // await fn.setbufvar(denops, "%", "lines", lines);
  const promises = [];

  for (const match of matches) {
    for (const capture of match.captures) {
      const getpos = async (capture: Parser.QueryCapture, captureName: string, highlightName: string, priority: number) => {
        if (capture.name === captureName) {
          const posnum = await fn.matchaddpos(
            denops,
            highlightName,
            [[
              capture.node.startPosition.row + 1,
              capture.node.startPosition.column + 1,
              capture.node.endPosition.column - capture.node.startPosition.column,
            ]],
            priority,
          );
          return posnum;
        }
      }

      promises.push(getpos(capture, "variable", "tsVariable", -10));
      promises.push(getpos(capture, "label", "tsLabel", 0));
      promises.push(getpos(capture, "escape", "tsEscape", 0));
      promises.push(getpos(capture, "constant", "tsConstant", 0));
      promises.push(getpos(capture, "operator", "tsOperator", 0));
      promises.push(getpos(capture, "property", "tsProperty", 0));
      promises.push(getpos(capture, "comment", "tsComment", 0));
      promises.push(getpos(capture, "string", "tsString", 0));
      promises.push(getpos(capture, "keyword", "tsKeyword", 0));
      promises.push(getpos(capture, "number", "tsNumber", 0));
      promises.push(getpos(capture, "type", "tsType", 0));
      promises.push(getpos(capture, "function", "tsFunction", 0));
    }
  }
  // 画面をリロード
  await denops.cmd("redraw");
  const result = await Promise.all(promises);
  return result;
}


// cの関数
export async function csetup(denops: Denops): Promise<void> {
  // parser
  const parser = new Parser();
  parser.setLanguage(C as unknown as Parser.Language);

  // query
  const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
  const langDir = await getLangDir(langUrl);
  const highlightsQueryPath = langDir + "/queries/highlights.scm";
  const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);
  const query = new Parser.Query(C as unknown as Parser.Language, highlightsQuery);
  let posnums: (number | undefined)[] = [];

  denops.dispatcher = {
    ... denops.dispatcher,
    async syntaxHighlight() {
      // posnumsが空でないなら削除
      if (posnums.length !== 0) {
        for (const posnum of posnums) {
          if (posnum !== undefined) {
            await fn.matchdelete(denops, posnum);
          }
        }
      }
      posnums = await applySyntaxHighlight(denops, parser, query)
    },
  };

  await autocmd.group(denops, "test", (helper) => {
    helper.remove("*");
    helper.define(
      "Filetype",
      "c",
      `call denops#request("${denops.name}", "syntaxHighlight", [])`
    );
  });
  // buffer編集時にも適用
  await autocmd.group(denops, "test", (helper) => {
    helper.remove("*");
    helper.define(
      "TextChanged",
      "*",
      `call denops#request("${denops.name}", "syntaxHighlight", [])`
    );
    helper.define(
      "TextChangedI",
      "*",
      `call denops#request("${denops.name}", "syntaxHighlight", [])`
    );
  });

  // 既に開いているバッファに対しても適用
  const filetype = await fn.getbufvar(denops, "%", "&filetype");
  if (filetype === "c") {
    await applySyntaxHighlight(denops, parser, query)
  }
}
