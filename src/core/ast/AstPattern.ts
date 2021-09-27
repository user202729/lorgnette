import { Ast, AstNode, AstVisitor } from "./Ast";

export class AstPattern implements AstVisitor<AstNode[]> {
    private test: (node: AstNode) => boolean;

    constructor(test: (node: AstNode) => boolean) {
        this.test = test;
    }

    visitNode(node: AstNode, matchingNodes: AstNode[]) {
        if (this.test(node)) {
            matchingNodes.push(node);
        }
    }

    apply(ast: Ast): AstNode[] {
        const matchingNodes: AstNode[] = [];
        ast.visitWith(this, matchingNodes);
        
        return matchingNodes;
    }
}