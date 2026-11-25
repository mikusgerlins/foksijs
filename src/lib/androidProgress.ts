import { Capacitor, registerPlugin } from "@capacitor/core";

type NativeProgress = {
  getAll(): Promise<{ values: Record<string, string> }>;
  set(options: { profileId: string; value: string }): Promise<void>;
};

const plugin = registerPlugin<NativeProgress>("ProfileProgress");
export const androidProgress = Capacitor.getPlatform() === "android" ? plugin : null;
