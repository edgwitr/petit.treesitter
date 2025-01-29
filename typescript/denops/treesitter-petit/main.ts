import type { Entrypoint } from "jsr:@denops/std@^7.4.0";
import * as merge from "npm:deepmerge";
import type { Setup } from "./lang/lang.ts";

const TEMPLATE = {
  highlight: false as boolean,
  ensure_installed: [] as string[],
}

export const main: Entrypoint = async (denops) => {
  denops.dispatcher = {
    async setup(config: unknown): Promise<void> {
      const configStr = config as string;
      // merge
      const result = merge.default(TEMPLATE, configStr);
      if (result.highlight) {
        console.log("Highlight");
      }

      const LANGUAGES: Record<string, string> = {
        "c": "./lang/c.ts",
        "cpp": "./lang/cpp.ts",
        "rust": "./lang/rust.ts",
        "typescript": "./lang/typescript.ts",
      }
      for (const lang of result.ensure_installed) {
        if (LANGUAGES[lang]) {
          const langModule = await import(LANGUAGES[lang]);
          const setup: Setup = langModule.setup;
          setup(denops,result.highlight);
        }
      }
    },
  };
};
