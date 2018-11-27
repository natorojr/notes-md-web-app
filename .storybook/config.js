import { addDecorator, configure } from '@storybook/react';
import ThemeProvider from 'mineral-ui/themes/ThemeProvider';
import React from 'react';

addDecorator(renderStory => (
  <ThemeProvider>
    <div style={{ padding: 10, border: '1px solid red' }}>{renderStory()}</div>
  </ThemeProvider>
));

function loadStories() {
  require('../src/ui/components/Editor.storybook');
  require('../src/ui/components/List.storybook');
}

configure(loadStories, module);
