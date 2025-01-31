import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";
import { Config } from "./main.ts"
import type { Lang } from "./lang/lang.ts";

// [winid, bufferid] : matchid[]の形のリスト
const allHighlights: Map<[number, number], number[]> = new Map();

export const deleteHighlight = async (denops: Denops, winId: number, bufId: number): Promise<void> => {
  if (allHighlights.has([winId, bufId])) {
    const matchIds = allHighlights.get([winId, bufId]);
    if (matchIds) {
      await Promise.all(matchIds.map(matchId => fn.matchdelete(denops, matchId)));
    }
  }
}

export const applyHighlight = async (denops: Denops, matches:Parser.QueryMatch[]): Promise<void> => {
  const promises: Promise<number>[] = [];

  function getMatchID (match: Parser.QueryMatch, captureName: string, highlightName: string, priority: number) {
    return match.captures
      .filter(capture => capture.name === captureName)
      .map(capture => fn.matchaddpos(
        denops,
        highlightName,
        [[
          capture.node.startPosition.row + 1,
          capture.node.startPosition.column + 1,
          capture.node.endPosition.column - capture.node.startPosition.column,
        ]],
        priority,
      ));
  }

  const HIGHLIGHTS = [
    { captureName: "variable", highlightName: "tsVariable", priority: -1 },
    { captureName: "variable.parameter", highlightName: "tsVariable", priority: -1 },
    { captureName: "label", highlightName: "tsLabel", priority: 0 },
    { captureName: "escape", highlightName: "tsEscape", priority: 0 },
    { captureName: "constant", highlightName: "tsConstant", priority: 0 },
    { captureName: "operator", highlightName: "tsOperator", priority: 0 },
    { captureName: "property", highlightName: "tsProperty", priority: 0 },
    { captureName: "comment", highlightName: "tsComment", priority: 0 },
    { captureName: "string", highlightName: "tsString", priority: 0 },
    { captureName: "keyword", highlightName: "tsKeyword", priority: 0 },
    { captureName: "number", highlightName: "tsNumber", priority: 0 },
    { captureName: "type", highlightName: "tsType", priority: 0 },
    { captureName: "type.builtin", highlightName: "tsType", priority: 0 },
    { captureName: "function", highlightName: "tsFunction", priority: 0 },
    { captureName: "function.method", highlightName: "tsFunction", priority: 0 },
  ];

  for (const match of matches) {
    for (const { captureName, highlightName, priority } of HIGHLIGHTS) {
      promises.push(...getMatchID(match, captureName, highlightName, priority));
    }
  }

  const result = await Promise.all(promises);
  const winId = await fn.win_getid(denops);
  const bufId = await fn.bufnr(denops, "%");
  allHighlights.set([winId, bufId], result);
}

export async function setupHighlight(denops: Denops) {
  await autocmd.group(denops, "Highlight", (helper) => {
    helper.remove("*");
    helper.define(
      ["BufEnter", "TextChanged", "TextChangedI"],
      "*",
      `call denops#request("${denops.name}", "Highlight", [])`
    );
  });
  denops.dispatcher = {
    ...denops.dispatcher,
    async Highlight() {
      const t = "treesitter-petit";
      const filetype = await fn.getbufvar(denops, "%", "&filetype") as string;
      const isTarget = await denops.dispatch(t, "getTarget", [filetype]) as boolean;
      if (!isTarget) {
        return;
      }
      const config = await denops.dispatch(t, "getConfig") as Config;
      if (!isTarget || !config.highlight.enable || config.highlight.disable.includes("highlight")) {
        return;
      }
      const userQuery = config.highlight.queries[filetype];
      const lang = await denops.dispatch(t, "getLanguage",[filetype]) as Lang;
      // console.debug(lang.queries)
      // const query = userQuery ? userQuery: lang.queries["highlights"];
      // const matches = await denops.dispatch(t, "execQuery",[filetype, query]) as Parser.QueryMatch[];
      // await applyHighlight(denops, matches);
    },
  }
}
