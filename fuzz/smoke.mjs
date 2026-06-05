import assert from 'node:assert/strict';
import { createDocument, entityNode, actionNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitCHeader, emitCHeaderWithSourceMap } from '../dist/index.js';

for (let index = 0; index < 100; index += 1) {
  const document = createDocument({ id: `doc_${index}`, name: `Doc${index}`, nodes: [
    entityNode({ id: `ent_${index}`, name: 'Todo', fields: [{ id: `field_title_${index}`, name: 'title', type: 'Text' }] }),
    actionNode({ id: `action_${index}`, name: 'update_todo', input: 'Todo', returns: 'Patch' })
  ] });
  const output = emitCHeader(document);
  const mapped = emitCHeaderWithSourceMap(document, { targetPath: `doc_${index}.h` });
  const todoMapping = mapped.sourceMap.mappings.find((mapping) => mapping.semanticNodeId === `ent_${index}`);
  assert.match(output, /typedef struct Todo/);
  assert.match(output, /frontier_patch_list update_todo/);
  assert.equal(mapped.code, output);
  assert.equal(mapped.sourceMap.target.language, 'c');
  assert.equal(todoMapping.generatedSpan.targetPath, `doc_${index}.h`);
}
