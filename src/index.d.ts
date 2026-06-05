import type { FrontierLangDocument } from '@shapeshift-labs/frontier-lang-kernel';

export interface EmitCHeaderOptions {
  readonly banner?: string;
  readonly guard?: string;
}

export interface CSourceRef {
  readonly semanticNodeId: string;
  readonly semanticNodeKind?: string;
  readonly semanticNodeName?: string;
  readonly regionIds?: readonly string[];
}

export type CAstDeclaration =
  | {
      readonly kind: 'opaqueStruct';
      readonly name: string;
    }
  | {
      readonly kind: 'capabilityMacro';
      readonly name: string;
      readonly value: string;
      readonly sourceRef?: CSourceRef;
    }
  | {
      readonly kind: 'struct';
      readonly name: string;
      readonly fields: readonly { readonly name: string; readonly type: string }[];
      readonly sourceRef?: CSourceRef;
    }
  | {
      readonly kind: 'functionPrototype';
      readonly name: string;
      readonly returnType: string;
      readonly parameters: readonly { readonly name: string; readonly type: string }[];
      readonly sourceRef?: CSourceRef;
    };

export interface CAstHeader {
  readonly kind: 'c.header';
  readonly banner: string;
  readonly guard: string;
  readonly declarations: readonly CAstDeclaration[];
}

export declare function toCAst(document: FrontierLangDocument, options?: EmitCHeaderOptions): CAstHeader;
export declare function renderCAst(ast: CAstHeader): string;
export declare function emitCHeader(document: FrontierLangDocument, options?: EmitCHeaderOptions): string;
