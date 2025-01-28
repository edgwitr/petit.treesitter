import type { Entrypoint } from "jsr:@denops/std@^7.4.0";
import * as merge from "npm:deepmerge";
import type { Setup } from "../lang/lang.ts";

const TEMPLATE = {
  highlight: false as boolean,
  ensure_installed: [] as string[],
}

export const main: Entrypoint = async (denops) => {
  denops.dispatcher = {
    async setup(config: unknown): Promise<void> {
      const configStr = config as string;
      //configstrをjsonに変換
      const configJson = JSON.parse(configStr);
      //configJsonをマージ
      const result = merge.default(TEMPLATE, configJson);
      console.log(result);
      if (result.highlight) {
        console.log("Highlight");
      }

      const LANGUAGES: Record<string, string> = {
        "c": "../lang/c.ts",
        "cpp": "../lang/cpp.ts",
      }
      for (const lang of result.ensure_installed) {
        console.log(lang);
        if (LANGUAGES[lang]) {
          const langfile = await import(LANGUAGES[lang])
          console.log(typeof langfile);
        }
      }
    },
  };
};
