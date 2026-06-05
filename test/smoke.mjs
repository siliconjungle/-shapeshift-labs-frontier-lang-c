import assert from 'node:assert/strict';
import { actionNode, capabilityNode, createDocument, entityNode, typeNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitCHeader, renderCAst, toCAst } from '../dist/index.js';

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
assert.equal(ast.kind, 'c.header');
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'struct' && declaration.name === 'Todo'), true);
assert.equal(ast.declarations.some((declaration) => declaration.kind === 'capabilityMacro' && declaration.name === 'RENDER_VIEW_CAPABILITY'), true);
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'struct' && declaration.name === 'Todo').sourceRef.semanticNodeId, 'entity_todo');
assert.equal(renderCAst(ast), out);
assert.match(out, /typedef struct TodoInput/);
assert.match(out, /#define RENDER_VIEW_CAPABILITY "view\.render"/);
assert.match(out, /const char \* title/);
assert.match(out, /typedef struct Todo/);
assert.match(out, /int64_t count/);
assert.match(out, /frontier_patch_list add_todo/);
