const path = require('path');

module.exports = {
  // Inherit the conference-wide preset (stylelint-config-standard +
  // stylelint-config-standard-scss + project rules) so all existing checks
  // (font-family, longhand props, recess-order, color notation, ...) remain
  // identical to the rest of the conference packages.
  extends: [path.resolve(__dirname, '../../.stylelintrc.json')],
  overrides: [
    {
      // CSS Modules: class selectors are surfaced to JS as
      // `classes.iconButton`, so the React + CSS Modules convention uses
      // camelCase rather than the kebab-case enforced by
      // stylelint-config-standard. Allow both styles so that previously valid
      // kebab-case selectors keep passing.
      files: ['**/*.module.scss'],
      rules: {
        'selector-class-pattern': [
          '^[a-z][a-zA-Z0-9-]*$',
          {
            message:
              'Expected class selector to be camelCase or kebab-case (CSS Modules convention)',
          },
        ],
      },
    },
  ],
};
