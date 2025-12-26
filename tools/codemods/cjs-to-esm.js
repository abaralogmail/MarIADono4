/**
 * jscodeshift transform to convert simple CommonJS patterns to ESM
 * - const x = require('y') -> import x from 'y';
 * - const {a,b} = require('y') -> import {a,b} from 'y';
 * - module.exports = X -> export default X;
 * - exports.foo = bar -> export const foo = bar;
 *
 * Note: This codemod is conservative and handles common simple cases.
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let addedImports = [];

  // transform require() variable declarations
  root.find(j.VariableDeclaration)
    .filter(path => path.node.declarations.some(d => d.init && d.init.type === 'CallExpression' && d.init.callee.name === 'require'))
    .forEach(path => {
      const decls = path.node.declarations;
      const newImports = [];
      decls.forEach(d => {
        if(d.init && d.init.type === 'CallExpression' && d.init.callee.name === 'require'){
          const arg = d.init.arguments[0];
          if(arg && arg.type === 'Literal'){
            const source = arg.value;
            if(d.id.type === 'Identifier'){
              newImports.push(j.importDeclaration([j.importDefaultSpecifier(j.identifier(d.id.name))], j.literal(source)));
            }else if(d.id.type === 'ObjectPattern'){
              const specs = d.id.properties.map(p => j.importSpecifier(j.identifier(p.key.name), j.identifier(p.value.name || p.key.name)));
              newImports.push(j.importDeclaration(specs, j.literal(source)));
            }
          }
        }
      });
      if(newImports.length){
        // replace the variable declaration with imports
        j(path).replaceWith(newImports);
      }
    });

  // transform module.exports = ...  -> export default ...
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'module' },
      property: { name: 'exports' }
    }
  }).forEach(p => {
    const rhs = p.node.right;
    const exportDecl = j.exportDefaultDeclaration(rhs);
    j(p.parent).replaceWith(exportDecl);
  });

  // transform exports.foo = bar -> export const foo = bar
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'exports' }
    }
  }).forEach(p => {
    const prop = p.node.left.property;
    const rhs = p.node.right;
    const name = prop.name || prop.value;
    const varDecl = j.exportNamedDeclaration(j.variableDeclaration('const', [j.variableDeclarator(j.identifier(name), rhs)]));
    j(p.parent).replaceWith(varDecl);
  });

  return root.toSource({ quote: 'single' });
};
