import { JSON_LANGUAGE } from "./json/language";
import { MATHEMATICS_LANGUAGE } from "./math/language";
import { Parser } from "./Parser";
import { TYPESCRIPT_LANGUAGE } from "./typescript/language";

export interface Language {
  name: string;
  id: string;
  codeEditorLanguageId: string;
  parser: Parser | null;
};

export const SUPPORTED_LANGUAGES = [
  TYPESCRIPT_LANGUAGE,
  MATHEMATICS_LANGUAGE,
  JSON_LANGUAGE
] as const;

export type SupportedLanguages = typeof SUPPORTED_LANGUAGES[number];