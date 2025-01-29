import type { Denops } from "jsr:@denops/std@^7.4.0";

export type Setup = (denops: Denops, highlight: boolean) => Promise<void>;
