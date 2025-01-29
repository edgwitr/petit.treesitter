import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
import * as fn from "jsr:@denops/std/function";

export const applyHighlight = async (denops: Denops, parser: Parser, query: Parser.Query): Promise<number[]> => {
  const lines = await fn.getline(denops, 1, "$");
  const tree = parser.parse(lines.join("\n"));
  const matches = query.matches(tree.rootNode);
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
  return result;
}
