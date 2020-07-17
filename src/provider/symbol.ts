import * as vscode from 'vscode';
import { ABL_MODE } from '../environment';
import { DocumentController } from '../documentController';
import { Document } from '../documentModel';

export class Symbol implements vscode.DocumentSymbolProvider {

    static attach(context: vscode.ExtensionContext) {
        let instance = new Symbol();
        instance.registerCommands(context);
	}

	private registerCommands(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(ABL_MODE.language, this));
    }

    public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
        let doc = DocumentController.getInstance().getDocument(document);
        if (doc) {
            let documentSymbols = this.documentSymbols.bind(this);
            return new Promise(resolve => {
                process.nextTick(() => {
                    if (!token.isCancellationRequested)
                        resolve(documentSymbols(doc));
                    else
                        resolve();
                });
            });
        }
        return;
    }

    private documentSymbols(document: Document): vscode.SymbolInformation[] {
        let symbols:vscode.SymbolInformation[] = [];
        // methods / params / local variables
        document.methods.forEach(method => {
            symbols.push(new vscode.SymbolInformation(method.name, vscode.SymbolKind.Method, 'Methods', new vscode.Location(document.document.uri, method.range)));
            // parameters
            method.params?.forEach(param => {
                symbols.push(new vscode.SymbolInformation(param.name, vscode.SymbolKind.Property, method.name, new vscode.Location(document.document.uri, param.position)));
            });
            // local variables
            method.localVariables?.forEach(variable => {
                symbols.push(new vscode.SymbolInformation(variable.name, vscode.SymbolKind.Variable, method.name, new vscode.Location(document.document.uri, variable.position)));
            });
        });
        return symbols;
    }
}
