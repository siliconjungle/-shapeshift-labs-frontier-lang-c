import type { FrontierLangDocument } from '@shapeshift-labs/frontier-lang-kernel';

export interface EmitCHeaderOptions {
  readonly banner?: string;
  readonly guard?: string;
  readonly sourceMapId?: string;
  readonly sourcePath?: string;
  readonly sourceHash?: string;
  readonly target?: FrontierProjectionTarget;
  readonly targetPath?: string;
  readonly targetHash?: string;
  readonly semanticIndexId?: string;
  readonly universalAstId?: string;
  readonly nativeAstId?: string;
  readonly nativeSourceId?: string;
  readonly sourceSpansBySemanticNodeId?: Readonly<Record<string, FrontierProjectionSourceSpan>>;
  readonly semanticSymbolIdsBySemanticNodeId?: Readonly<Record<string, string>>;
  readonly semanticOccurrenceIdsBySemanticNodeId?: Readonly<Record<string, string>>;
  readonly lossIdsBySemanticNodeId?: Readonly<Record<string, readonly string[]>>;
  readonly evidence?: readonly FrontierProjectionEvidenceRecord[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface FrontierProjectionTarget {
  readonly language?: string;
  readonly platform?: string;
  readonly packageName?: string;
  readonly emitPath?: string;
  readonly [key: string]: unknown;
}

export interface FrontierProjectionSourceSpan {
  readonly path?: string;
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
}

export interface FrontierProjectionGeneratedSpan extends FrontierProjectionSourceSpan {
  readonly target?: FrontierProjectionTarget;
  readonly targetPath?: string;
  readonly generatedName?: string;
}

export interface FrontierProjectionEvidenceRecord {
  readonly id: string;
  readonly kind?: string;
  readonly summary?: string;
  readonly [key: string]: unknown;
}

export interface FrontierProjectionSourceMapMapping {
  readonly id: string;
  readonly semanticNodeId: string;
  readonly nativeSourceId?: string;
  readonly semanticSymbolId?: string;
  readonly semanticOccurrenceId?: string;
  readonly sourceSpan?: FrontierProjectionSourceSpan;
  readonly generatedSpan: FrontierProjectionGeneratedSpan;
  readonly target?: FrontierProjectionTarget;
  readonly generatedName?: string;
  readonly evidenceIds?: readonly string[];
  readonly lossIds?: readonly string[];
  readonly precision: 'declaration';
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface FrontierProjectionSourceMap {
  readonly kind: 'frontier.lang.sourceMap';
  readonly version: 1;
  readonly id: string;
  readonly sourcePath?: string;
  readonly sourceHash?: string;
  readonly target?: FrontierProjectionTarget;
  readonly targetPath?: string;
  readonly targetHash?: string;
  readonly semanticIndexId?: string;
  readonly universalAstId?: string;
  readonly nativeAstId?: string;
  readonly nativeSourceId?: string;
  readonly mappings: readonly FrontierProjectionSourceMapMapping[];
  readonly evidence: readonly FrontierProjectionEvidenceRecord[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface CSourceMapResult {
  readonly code: string;
  readonly sourceMap: FrontierProjectionSourceMap;
}

export interface EmitCHeaderWithSourceMapResult extends CSourceMapResult {
  readonly ast: CAstHeader;
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
export declare function renderCAstWithSourceMap(ast: CAstHeader, options?: EmitCHeaderOptions): CSourceMapResult;
export declare function emitCHeader(document: FrontierLangDocument, options?: EmitCHeaderOptions): string;
export declare function emitCHeaderWithSourceMap(document: FrontierLangDocument, options?: EmitCHeaderOptions): EmitCHeaderWithSourceMapResult;
