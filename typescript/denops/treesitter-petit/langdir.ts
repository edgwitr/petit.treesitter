import * as Path from "jsr:@std/path";

export const getLangDir = async (langUrl: string) :Promise<string | null> => {
  const fileSystemPath: string = Path.fromFileUrl(langUrl);

  let modulePath = Path.dirname(fileSystemPath);
  while (!modulePath.endsWith("/npm")) {
    try {
      await Deno.stat(modulePath + "/queries");
      return modulePath;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        modulePath = Path.dirname(modulePath);
      } else {
        throw error;
      }
    }
  }
  return null;
}
