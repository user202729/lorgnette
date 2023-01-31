import React from "react";
import { TreePatternFinder } from "../core/fragments/syntactic/TreePatternFinder";
import { SyntaxTreePattern, SKIP_MATCH_DESCENDANTS } from "../core/languages/SyntaxTreePattern";
import { ProgrammableInputMapping } from "../core/mappings/ProgrammableInputMapping";
import { ProgrammableOutputMapping } from "../core/mappings/ProgrammableOutputMapping";
import { SyntacticMonocleProvider } from "../core/monocles/syntactic/SyntacticMonocleProvider";
import { AsideRenderer } from "../core/renderers/aside/AsideRenderer";
import { AsideRendererPosition } from "../core/renderers/aside/AsideRendererSettings";
import { TreePatternTemplate } from "../core/templates/syntactic/TreePatternTemplate";
import { BooleanValuator } from "../core/templates/valuators/BooleanValuator";
import { NumericValuator } from "../core/templates/valuators/NumericValuator";
import { Valuator, ValuatorSettings } from "../core/templates/valuators/Valuator";
import { TextualValuator } from "../core/templates/valuators/TextualValuator";
import { Form } from "../core/user-interfaces/form/Form";
import { NumberInput } from "../core/user-interfaces/form/form-elements/NumberInput";
import { Select } from "../core/user-interfaces/form/form-elements/Select";
import { StringInput } from "../core/user-interfaces/form/form-elements/StringInput";
import { Switch } from "../core/user-interfaces/form/form-elements/Switch";
import { FormEntry, FormEntryType } from "../core/user-interfaces/form/FormEntry";
import { Button } from "../core/user-interfaces/form/form-elements/Button";
import { BLUE, Color, GREEN, RED } from "../utilities/Color";
import { ButtonColorPicker } from "../core/user-interfaces/form/form-elements/ButtonColorPicker";
import { ButtonGroup } from "../core/user-interfaces/form/form-elements/ButtonGroup";
import { JavascriptLiteralObjectTemplate } from "../utilities/languages/javascript/JavascriptLiteralObjectTemplate";

export const testFormProvider = new SyntacticMonocleProvider({
    name: "Form test",

    usageRequirements: { languages: ["typescript"] },

    fragmentProvider: new TreePatternFinder(new SyntaxTreePattern(
        n => n.type === "ObjectLiteralExpression",
        SKIP_MATCH_DESCENDANTS
    )),

    inputMapping: new ProgrammableInputMapping(({ fragment, document }) => {
        const formEntries: FormEntry[] = [];

        // Get all the property assignments inside the object literal.
        const propertyAssignmentNodes = fragment.node.childNodes[1].childNodes.filter(node => node.type === "PropertyAssignment");

        // Create one form entry per property.
        for (let node of propertyAssignmentNodes) {
            const key = node.childNodes[0].text;
            const valueNode = node.childNodes[2];

            switch (valueNode.type) {
                case "FirstLiteralToken": // Number
                    formEntries.push({
                        type: FormEntryType.Number,
                        key: key,
                        value: Number(valueNode.text)
                    });
                    break;
                
                case "StringLiteral": // String
                    formEntries.push({
                        type: FormEntryType.String,
                        key: key,
                        value: valueNode.text.slice(1, -1)
                    });
                    break;
                
                case "TrueKeyword":
                case "FalseKeyword": // Boolean
                    formEntries.push({ 
                        type: FormEntryType.Boolean,
                        key: key,
                        value: valueNode.type === "TrueKeyword" ? true : false
                    });
                    break;
            }
        }

        return {
            data: formEntries
        };
    }),

    outputMapping: new ProgrammableOutputMapping(({ output, documentEditor, fragment }) => {
        // TODO
        console.log("Modified form entry:", output.modifiedData)
    }),

    userInterfaceProvider: Form.makeProvider(<>
        <h4 style={{ textAlign: "center" }}>Test form</h4>
        Some text introducing the purpose of this form and explaining some details.<br/>
        <NumberInput formEntryKey="a" label="Some number" />
        <StringInput formEntryKey="b" label="Some string" />
        <Select formEntryKey="c" items={["foo", "bar"]} />
        Some text explaining the purpose of the next form element.<br/>
        <Switch formEntryKey="d" label="Some boolean" />
        Some conclusive text...<br/>
    </>),
    
    rendererProvider: AsideRenderer.makeProvider({
        onlyShowWhenCursorIsInRange: true,
        position: AsideRendererPosition.RightSideOfCode
    })
});

// Make valuators automatically wrap values into a form entry,
// i.e., the kind of object expected by each form element.
function createValuatorSettings(key: string, type: FormEntryType): Partial<ValuatorSettings> {
    if (type === FormEntryType.Color) {
        return {
            transformGetterValue: colorAsText => {
                return { value: Color.fromCss(colorAsText), type, key };
            },
            transformSetterValue: (color: Color) => {
                return color.css;
            }
        };
    }

    return {
        transformGetterValue: value => {
            return { value, type, key };
        }
    };
}

function createValuator(key: string, type: FormEntryType): Valuator {
    const valuatorSettings = createValuatorSettings(key, type);
    switch (type) {
        case FormEntryType.Number:
            return new NumericValuator(valuatorSettings);
        case FormEntryType.Boolean:
            return new BooleanValuator(valuatorSettings);
        case FormEntryType.Color:
            return new TextualValuator(valuatorSettings);
        case FormEntryType.String:
        default:
            return new TextualValuator(valuatorSettings);
    }
}

const testFormTemplate = JavascriptLiteralObjectTemplate.createForAnyContext(
    [
        { key: "a", valuator: createValuator("a", FormEntryType.Number) },
        { key: "b", valuator: createValuator("b", FormEntryType.String) },
        { key: "c", valuator: createValuator("c", FormEntryType.String) },
        { key: "d", valuator: createValuator("d", FormEntryType.Boolean) },
        { key: "color", valuator: createValuator("color", FormEntryType.Color) }
    ],
    {
        transformTemplateData: data => { return { data: [...Object.values(data)] }; },
        transformUserInterfaceOutput: output => {
            return output.modifiedData.reduce(
                (keysToModifiedEntries: any, entry: any) => {
                    return { ...keysToModifiedEntries, [entry.key]: entry.value  }
                },
                {}
            )
        },
    }
);

export const testFormProvider2 = new SyntacticMonocleProvider({
    name: "Form test",

    usageRequirements: { languages: ["typescript"] },

    ...testFormTemplate.monocleProviderProperties,

    userInterfaceProvider: Form.makeProvider(<>
        <h4 style={{ textAlign: "center" }}>Test form</h4>
        Some text introducing the purpose of this form and explaining some details.<br/>

        <NumberInput formEntryKey="a" label="Some number" />
        <StringInput formEntryKey="b" label="Some string" />
        <Select formEntryKey="c" items={["foo", "bar"]} />

        Some text explaining the purpose of the next form element.<br/>

        <Switch formEntryKey="d" label="Some boolean" />

        Test of a button colour picker followed by a group of buttons: <br/>
        <ButtonColorPicker
            formEntryKey="color"
            style={{ margin: "0 1ex" }}
        />
        <ButtonGroup>
            <Button<FormEntryType.Color>
                formEntryKey="color"
                text="Red"
                valueWithType={[RED, FormEntryType.Color]}
                activateOn={color => (color && color.equals(RED)) ?? false}
                style={{ color: "darkred" }}
            />
            <Button<FormEntryType.Color>
                formEntryKey="color"
                text="Green"
                valueWithType={[GREEN, FormEntryType.Color]}
                activateOn={color => (color && color.equals(GREEN)) ?? false}
                style={{ color: "darkgreen" }}
            />
            <Button<FormEntryType.Color>
                formEntryKey="color"
                text="Blue"
                valueWithType={[BLUE, FormEntryType.Color]}
                activateOn={color => (color && color.equals(BLUE)) ?? false}
                style={{ color: "darkblue" }}
            />
        </ButtonGroup>
        <br/>

        Some conclusive text...<br/>
    </>),
    
    rendererProvider: AsideRenderer.makeProvider({
        onlyShowWhenCursorIsInRange: true,
        position: AsideRendererPosition.RightSideOfCode
    })
});
