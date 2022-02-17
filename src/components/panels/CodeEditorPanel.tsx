import React, { ReactElement } from "react";
import "./panels.css";
import TabPanel from "./TabPanel";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { Button, Label, Menu, MenuItem } from "@blueprintjs/core";
import { GlobalContext, GlobalContextContent } from "../../context";
import { Language, SUPPORTED_LANGUAGES } from "../../core/languages/Language";
import { SyntaxTree } from "../syntax-tree/SyntaxTree";
import { AugmentedCodeEditor } from "../augmented-code-editor/AugmentedCodeEditor";
import { DEFAULT_EXAMPLE, Example, EXAMPLES } from "../code-examples/Example";
import { Popover2 } from "@blueprintjs/popover2";
import { Document } from "../../core/documents/Document";

type Props = {};
type State = {
    currentExample: Example;
};

export class CodeEditorPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentExample: DEFAULT_EXAMPLE
        }
    }

    private renderLanguageSelector(context: GlobalContextContent): ReactElement {
        const renderLanguageSelectorItem: ItemRenderer<Language> = (
            language,
            { handleClick, modifiers }
        ) => {
            if (!modifiers.matchesPredicate) {
                return null;
            }
            
            return <MenuItem
                active={modifiers.active}
                key={language.id}
                text={language.name}
                label={language.id}
                onClick={handleClick}
            />;
        };
            
        const LanguageSelect = Select.ofType<Language>();
        return <LanguageSelect
            items={[...SUPPORTED_LANGUAGES]}
            itemRenderer={renderLanguageSelectorItem}
            onItemSelect={newLanguage => context.updateDocument(new Document(newLanguage, context.document.content))}
            activeItem={context.document.language}
        >
            <Button text={context.document.language.name} rightIcon="caret-down" />
        </LanguageSelect>;
        
    }

    private renderExampleSelector(context: GlobalContextContent): ReactElement {
        const renderExampleMenuItem = (example: Example): ReactElement => {
            return <MenuItem
                key={example.name}
                text={example.name}
                onClick={() => {
                    this.setState({ currentExample: example });
                    context.updateDocument(new Document(
                        example.document.language,
                        example.document.content
                    ))
                }}
            />;
        };
        
        const menu = <Menu className="bp3-menu">
            {EXAMPLES.map(example => renderExampleMenuItem(example))}
        </Menu>;
            
        return <Popover2
            content={menu}
            position="bottom"
            minimal={true}
            popoverClassName="bp3-popover"
            >
            <Button text="Load example..." rightIcon="caret-down" intent="primary" />
        </Popover2>
    }

    private renderSyntaxTree(context: GlobalContextContent): ReactElement {
        return <>
            <h3>Syntax tree</h3>
            <SyntaxTree
                document={context.document}
                onMouseEnterNode={node => context.updateCodeEditorRanges({ hovered: [node.range] })}
                onMouseLeaveNode={node => context.updateCodeEditorRanges({ hovered: [] })}
            />
        </>;
    }
    
    render() {
        return (
            <GlobalContext.Consumer>{ context => (
                <TabPanel>
                    <div className="code-editor-panel">
                        <div className="editor-with-menu">
                            <div className="menu-bar">
                                <Label className="bp3-inline" style={{ margin: 0 }}>
                                    Language:
                                    {this.renderLanguageSelector(context)}
                                </Label>
                                {this.renderExampleSelector(context)}
                            </div>
                            <AugmentedCodeEditor/>
                        </div>
                        <div className="syntax-tree">
                            {this.renderSyntaxTree(context)}
                        </div>
                    </div>
                </TabPanel>
            )}</GlobalContext.Consumer>
        );
    }
};
