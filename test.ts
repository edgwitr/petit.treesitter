import Parser from "npm:tree-sitter@^0.22.4";
import C from "npm:tree-sitter-c@^0.23.4";
import { getLangDir } from "./langdir.ts";
import { makeEdit } from "./parser_edit.ts";

const langUrl = await import.meta.resolve("npm:tree-sitter-c@^0.23.4");
const langDir = await getLangDir(langUrl);

// ハイライト用のクエリを読み込み
const highlightsQueryPath = langDir + "/queries/highlights.scm";
const highlightsQuery = await Deno.readTextFile(highlightsQueryPath);

// パーサを準備
const parser = new Parser();
parser.setLanguage(C as unknown as Parser.Language);

// test.c をパース
const codeOriginal = await Deno.readTextFile("test.c");
let tree = parser.parse(codeOriginal);

// Queryインスタンスを生成
const query = new Parser.Query(C as unknown as Parser.Language, highlightsQuery);
// -------------------------
// 初回のクエリ結果を表示
// -------------------------
let matches = query.matches(tree.rootNode);
// console.log("=== Original AST Query Results ===");
// for (const match of matches) {
//   console.log(`Pattern: ${match.pattern}`);
//   for (const capture of match.captures) {
//     console.log(`  Capture Name: ${capture.name}`);
//     console.log(`  Node Type: ${capture.node.type}`);
//     console.log(`  Start Pos: (${capture.node.startPosition.row}, ${capture.node.startPosition.column})`);
//     console.log(`  End Pos:   (${capture.node.endPosition.row}, ${capture.node.endPosition.column})`);
//   }
// }

// -------------------------
// 差分適用
// -------------------------
const codeDiff = await Deno.readTextFile("test_diff.c");


const edit = makeEdit(codeOriginal, codeDiff);
// tree を編集
tree.edit(edit);

// 差分を加えたコードを再度パース(第二引数に既存の tree を渡す)
tree = parser.parse(codeDiff, tree);

// -------------------------
// 差分適用後のクエリ結果を表示
// -------------------------
console.log("\n=== Diffed AST Query Results ===");
matches = query.matches(tree.rootNode);
for (const match of matches) {
  console.log(`Pattern: ${match.pattern}`);
  for (const capture of match.captures) {
    console.log(`  Capture Name: ${capture.name}`);
    console.log(`  Node Type: ${capture.node.type}`);
    console.log(`  Start Pos: (${capture.node.startPosition.row}, ${capture.node.startPosition.column})`);
    console.log(`  End Pos:   (${capture.node.endPosition.row}, ${capture.node.endPosition.column})`);
  }
}
