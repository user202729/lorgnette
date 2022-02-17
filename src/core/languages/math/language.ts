import { Language } from "../Language";
import { MathParser } from "./MathParser";

export const MATHEMATICS_LANGUAGE: Language = {
    name: "Mathematics",
    id: "mathematics",
    codeEditorLanguageId: "javascript",
    parser: new MathParser()
};