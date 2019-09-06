"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

var _stylelint = require("stylelint");

var _utils = require("../../utils");

var _postcssValueParser = require("postcss-value-parser");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = (0, _utils.namespace)("function-quote-no-quoted-strings-inside");

var messages = exports.messages = _stylelint.utils.ruleMessages(ruleName, {
  rejected: "Quote function used with an already-quoted string"
});

function rule(primary, _, context) {
  return function (root, result) {
    var validOptions = _stylelint.utils.validateOptions(result, ruleName, {
      actual: primary
    });

    if (!validOptions) {
      return;
    }

    // Setup variable naming.
    var vars = {};

    root.walkDecls(function (decl) {
      if (decl.prop[0] !== "$") {
        return;
      }

      (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        vars[decl.prop] = node.type;
      });
    });

    root.walkDecls(function (decl) {
      (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        // Verify that we're only looking at functions.
        if (node.type !== "function" || (0, _utils.isNativeCssFunction)(node.value) || node.value === "") {
          return;
        }

        // Verify we're only looking at quote() calls.
        if (node.value !== "quote") {
          return;
        }

        // Report error if first character is a quote.
        // postcss-value-parser represents quoted strings as type 'string' (as opposed to word)
        if (node.nodes[0].quote || vars[node.nodes[0].value] === "string") {
          if (context.fix) {
            var contents = /quote\((.*)\)/.exec(decl.value);

            decl.value = contents[1];
          } else {
            _stylelint.utils.report({
              message: messages.rejected,
              node: decl,
              result: result,
              ruleName: ruleName
            });
          }
        }
      });
    });
  };
}

exports.default = rule;