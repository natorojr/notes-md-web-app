import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import Editor from './Editor';

storiesOf('Editor', module)
  .add('renders without props', () => (
    <div style={{ height: 400 }}>
      <Editor />
    </div>
  ))
  .add('renders with valid note', () => (
    <div style={{ height: 400 }}>
      <Editor
        note={{
          id: '123',
          text: 'Some text',
          timeLastUpdated: new Date().toISOString()
        }}
      />
    </div>
  ))
  .add('renders with valid note in read mode', () => (
    <div style={{ height: 400 }}>
      <Editor
        note={{
          id: '123',
          text: 'Some text',
          timeLastUpdated: new Date().toISOString()
        }}
        mode={Editor.MODE_READ}
      />
    </div>
  ))
  .add('renders with invalid note', () => (
    <div style={{ height: 400 }}>
      <Editor note={{}} />
    </div>
  ))
  .add('calls onSave and onDelete', () => (
    <div style={{ height: 400 }}>
      <Editor
        note={{
          id: '123',
          text: 'Some text',
          timeLastUpdated: new Date().toISOString()
        }}
        onSave={action('SAVE_INITIATED')}
        onDelete={action('DELETE_INITIATED')}
      />
    </div>
  ));
