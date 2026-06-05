import type { FrontierLangDocument } from '@shapeshift-labs/frontier-lang-kernel';

export interface EmitCHeaderOptions {
  readonly banner?: string;
  readonly guard?: string;
}

export declare function emitCHeader(document: FrontierLangDocument, options?: EmitCHeaderOptions): string;
