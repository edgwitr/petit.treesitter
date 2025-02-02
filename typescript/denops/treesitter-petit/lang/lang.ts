import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";
export type queries = {
  highlights: string;
  injections?: string;
}

// parser, language, queriesを持つLang型をエクスポート
export type Lang = {
  parser: Parser;
  language: Parser.Language;
  queries: queries;
};
