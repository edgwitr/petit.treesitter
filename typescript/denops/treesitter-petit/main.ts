import type { Entrypoint } from "jsr:@denops/std@^7.4.0";
import { csetup } from "./c.ts";
import * as fn from "jsr:@denops/std/function";
import * as autocmd from "jsr:@denops/std/autocmd";

export const main: Entrypoint = async (denops) => {
  // // map change buffer
  // await autocmd.group(denops, "test", (helper) => {
  //   helper.remove("*");
  //   helper.define(
  //     "BufEnter",
  //     "*",
  //     `call denops#request("${denops.name}", "onEnterBuffer", [])`
  //   );
  // });
  denops.dispatcher = {
    async onEnterBuffer(): Promise<void> {
      const lines = await fn.getline(denops, 1, "$");
      console.log(lines);
    },
  };
  await csetup(denops);
};
