import assert from 'node:assert/strict';
import { actionNode, capabilityNode, createDocument, effectNode, entityNode, externNode, stateNode, typeNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitCHeader, emitCHeaderWithSourceMap, renderCAst, renderCAstWithSourceMap, toCAst } from '../dist/index.js';

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  typeNode({ id: 'type_input', name: 'TodoInput', fields: [{ id: 'title', name: 'title', type: 'Text' }] }),
  capabilityNode({ id: 'cap_render', name: 'RenderView', capability: 'view.render', unsupportedTargets: [
    { target: { language: 'c', platform: 'embedded' }, reason: 'Host display adapter required.' }
  ] }),
  effectNode({ id: 'effect_persist', name: 'PersistTodo', capability: 'storage.write', input: 'TodoInput', returns: 'Json', resources: ['TodoDb.todos'] }),
  externNode({ id: 'extern_persist', name: 'persistTodo', language: 'typescript', symbol: 'persistTodo', signature: { input: 'TodoInput', returns: 'Patch' }, effects: ['storage.write'], resources: ['TodoDb.todos'] }),
  entityNode({ id: 'entity_todo', name: 'Todo', fields: [{ id: 'count', name: 'count', type: 'Int' }] }),
  stateNode({ id: 'state_todo', name: 'TodoDb', collections: [{ id: 'collection_todos', name: 'todos', type: { kind: 'map', key: 'Text', value: { kind: 'ref', name: 'Todo' } } }] }),
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
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'struct' && declaration.name === 'TodoDbState'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'capabilityMacro' && declaration.name === 'RENDER_VIEW_CAPABILITY'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'capabilityMacro' && declaration.name === 'PERSIST_TODO_EFFECT_CAPABILITY'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'functionPrototype' && declaration.name === 'run_PersistTodo_effect'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'capabilityMacro' && declaration.name === 'PERSIST_TODO_EXTERN_SYMBOL'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'functionPrototype' && declaration.name === 'call_persistTodo_extern'), true);
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'struct' && declaration.name === 'Todo').sourceRef.semanticNodeId, 'entity_todo');
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'struct' && declaration.name === 'TodoDbState').sourceRef.semanticNodeId, 'state_todo');
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'functionPrototype' && declaration.name === 'run_PersistTodo_effect').sourceRef.semanticNodeId, 'effect_persist');
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'functionPrototype' && declaration.name === 'call_persistTodo_extern').sourceRef.semanticNodeId, 'extern_persist');
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
const effectMapping = rendered.sourceMap.mappings.find((mapping) => mapping.semanticNodeId === 'effect_persist' && mapping.generatedName === 'run_PersistTodo_effect');
assert.equal(effectMapping.generatedName, 'run_PersistTodo_effect');
const externMapping = rendered.sourceMap.mappings.find((mapping) => mapping.semanticNodeId === 'extern_persist' && mapping.generatedName === 'call_persistTodo_extern');
assert.equal(externMapping.generatedName, 'call_persistTodo_extern');
assert.match(out, /typedef struct TodoInput/);
assert.match(out, /#define RENDER_VIEW_CAPABILITY "view\.render"/);
assert.match(out, /typedef struct frontier_effect_env frontier_effect_env;/);
assert.match(out, /typedef struct frontier_extern_env frontier_extern_env;/);
assert.match(out, /#define PERSIST_TODO_EFFECT_CAPABILITY "storage\.write"/);
assert.match(out, /frontier_json_value run_PersistTodo_effect\(frontier_effect_env \* env, TodoInput input\)/);
assert.match(out, /#define PERSIST_TODO_EXTERN_SYMBOL "persistTodo"/);
assert.match(out, /#define PERSIST_TODO_EXTERN_LANGUAGE "typescript"/);
assert.match(out, /frontier_patch_list call_persistTodo_extern\(frontier_extern_env \* env, TodoInput input\)/);
assert.match(out, /const char \* title/);
assert.match(out, /typedef struct Todo/);
assert.match(out, /int64_t count/);
assert.match(out, /typedef struct TodoDbState/);
assert.match(out, /frontier_json_value todos/);
assert.match(out, /frontier_patch_list add_todo\(const TodoDbState \* state, TodoInput input\)/);
