import type { Denops } from "jsr:@denops/std@^7.4.0";
import Parser from "npm:tree-sitter@^0.22.4";

export class Lang {
  parser: Parser;
  language: Parser.Language;
  queries: Record<string, string>;
  constructor(parser: Parser, language: Parser.Language, queries: Record<string, string>) {
    this.parser = parser;
    this.language = language;
    this.queries = queries;
  }
}
