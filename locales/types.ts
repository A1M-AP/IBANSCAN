import type { ui } from "./ui.en";

type Translated<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Translated<U>[] : T extends object ? { [K in keyof T]: Translated<T[K]> } : T;
export type Ui = Translated<typeof ui>;
