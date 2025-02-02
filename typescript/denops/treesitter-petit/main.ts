import type { Entrypoint } from "jsr:@denops/std@^7.4.0";
import * as fn from "jsr:@denops/std/function";
import * as merge from "npm:deepmerge";
import Parser from "npm:tree-sitter@^0.22.4";
import type { Lang } from "./lang/lang.ts";
import { setupHighlight } from "./highlight.ts";

const LANGUAGES: Record<string, string> = {
  "c": "./lang/c.ts",
  // "cpp": "./lang/cpp.ts
  // "rust": "./lang/rust.ts",
  // "typescript": "./lang/typescript.ts",
}
const importTargets: Record<string, string> = {};
const importedLanguages: Record<string, Lang> = {};
export interface Config {
  highlight: {
    enable: boolean;
    disable: string[];
    queries: Record<string, string>;
  };
  ensure_installed: string[];
}

let CONFIG: Config = {
  highlight: {
    enable: false,
    disable: [],
    queries: {},
  },
  ensure_installed: [],
};
const checkLang = async (langName: string): Promise<boolean> => {
  if (!importTargets[langName]) {
    return false;
  }
  if (!importedLanguages[langName]) {
    const target = importTargets[langName];
    const langData = await import(target);
    importedLanguages[langName] = langData.default as Lang;
  }
  return true;
}

export const main: Entrypoint = async (denops) => {
  denops.dispatcher = {
    setConfig(config: unknown): void {
      const configStr = config as string;
      // merge
      CONFIG = merge.default(CONFIG, configStr) as Config;
      CONFIG.ensure_installed.forEach((lang) => {
        if (!LANGUAGES[lang]) {
          console.error(`Language ${lang} is not supported.`);
        } else {
          importTargets[lang] = LANGUAGES[lang];
          console.debug(`Language ${lang} is imported.`);
        }
      });
      if (CONFIG.highlight.enable) {
        setupHighlight(denops);
      }
    },
    getConfig(): unknown {
      return CONFIG;
    },
    getTarget(langName): boolean {
      return !!importTargets[langName as string];
    },
    async getLanguage(langName): Promise<Lang> {
      const result = await checkLang(langName as string);
      if (!result) {
        throw new Error(`Language ${langName} is not available.`);
      }
      return importedLanguages[langName as string];
    },
    async execQuery(...args: unknown[]): Promise<Parser.QueryMatch[] | void> {
      const [lang, queryString] = args as [string, string];
      await checkLang(lang);

      const parser: Parser = importedLanguages[lang].parser;
      const language: Parser.Language = importedLanguages[lang].language;
      const query: Parser.Query = new Parser.Query(language, queryString);
      const lines = await fn.getline(denops, 1, "$");
      const tree = parser.parse(lines.join("\n"));
      return query.matches(tree.rootNode);
    }
  };
};
