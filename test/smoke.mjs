import assert from 'node:assert/strict';
import { actionNode, capabilityNode, createDocument, entityNode, typeNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitCHeader, emitCHeaderWithSourceMap, renderCAst, renderCAstWithSourceMap, toCAst } from '../dist/index.js';

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  typeNode({ id: 'type_input', name: 'TodoInput', fields: [{ id: 'title', name: 'title', type: 'Text' }] }),
  capabilityNode({ id: 'cap_render', name: 'RenderView', capability: 'view.render', unsupportedTargets: [
    { target: { language: 'c', platform: 'embedded' }, reason: 'Host display adapter required.' }
  ] }),
  entityNode({ id: 'entity_todo', name: 'Todo', fields: [{ id: 'count', name: 'count', type: 'Int' }] }),
  actionNode({ id: 'action_add', name: 'add_todo', input: 'TodoInput', returns: 'Patch' })
] });
const out = emitCHeader(document);
const ast = toCAst(document);
const rendered = renderCAstWithSourceMap(ast, {
  sourceMapId: 'map_doc_c',
  sourcePath: 'doc.frontier',
  targetPath: 'doc.h',
  semanticIndexId: 'semantic_doc',
  sourceSpansBySemanticNodeId: {
    entity_todo: { path: 'doc.frontier', startLine: 9, startColumn: 1, endLine: 11, endColumn: 2 }
  },
  semanticSymbolIdsBySemanticNodeId: {
    entity_todo: 'symbol_todo'
  },
  lossIdsBySemanticNodeId: {
    entity_todo: ['loss_collection_type']
  },
  evidence: [{ id: 'evidence_projection', kind: 'projection', summary: 'smoke projection evidence' }]
});
const emitted = emitCHeaderWithSourceMap(document, { targetPath: 'doc.h' });
assert.equal(ast.kind, 'c.header');
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'struct' && declaration.name === 'Todo'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'capabilityMacro' && declaration.name === 'RENDER_VIEW_CAPABILITY'), true);
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'struct' && declaration.name === 'Todo').sourceRef.semanticNodeId, 'entity_todo');
assert.equal(renderCAst(ast), out);
assert.equal(rendered.code, out);
assert.equal(emitted.code, out);
assert.equal(emitted.ast.kind, 'c.header');
assert.equal(rendered.sourceMap.kind, 'frontier.lang.sourceMap');
assert.equal(rendered.sourceMap.id, 'map_doc_c');
assert.equal(rendered.sourceMap.target.language, 'c');
assert.equal(rendered.sourceMap.targetPath, 'doc.h');
assert.equal(rendered.sourceMap.semanticIndexId, 'semantic_doc');
const todoMapping = rendered.sourceMap.mappings.find((mapping) => mapping.semanticNodeId === 'entity_todo');
assert.equal(todoMapping.generatedName, 'Todo');
assert.equal(todoMapping.generatedSpan.targetPath, 'doc.h');
assert.equal(todoMapping.generatedSpan.startLine > 0, true);
assert.equal(todoMapping.sourceSpan.path, 'doc.frontier');
assert.equal(todoMapping.semanticSymbolId, 'symbol_todo');
assert.deepEqual(todoMapping.lossIds, ['loss_collection_type']);
assert.deepEqual(todoMapping.evidenceIds, ['evidence_projection']);
assert.deepEqual(todoMapping.metadata.regionIds, ['count']);
assert.match(out, /typedef struct TodoInput/);
assert.match(out, /#define RENDER_VIEW_CAPABILITY "view\.render"/);
assert.match(out, /const char \* title/);
assert.match(out, /typedef struct Todo/);
assert.match(out, /int64_t count/);
assert.match(out, /frontier_patch_list add_todo/);
