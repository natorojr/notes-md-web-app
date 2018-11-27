import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import List from './List';

const now = new Date().toISOString();

storiesOf('List', module)
  .add('renders without props', () => <List />)
  .add('renders a single note', () => (
    <List
      notes={[
        {
          id: '123',
          text: '# This has a title\nA B C D E F',
          timeLastUpdated: now
        }
      ]}
    />
  ))
  .add('renders multiple notes', () => (
    <List
      notes={[
        {
          id: '123',
          text: '# This has a title\nA B C D E F',
          timeLastUpdated: now
        },
        {
          id: '124',
          text: 'G H I J K L M N O',
          timeLastUpdated: now
        }
      ]}
    />
  ))
  .add('calls onSelect', () => (
    <List
      notes={[
        {
          id: '123',
          text: '# This has a title\nA B C D E F',
          timeLastUpdated: now
        },
        {
          id: '124',
          text: 'G H I J K L M N O',
          timeLastUpdated: now
        }
      ]}
      onSelect={action('SELECT_INITIATED')}
    />
  ));
