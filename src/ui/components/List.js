import { css } from 'emotion';
import get from 'lodash.get';
import isEmpty from 'lodash.isempty';
import noop from 'lodash.noop';
import orderBy from 'lodash.orderby';
import Flex, { FlexItem } from 'mineral-ui/Flex';
import Menu, { MenuItem } from 'mineral-ui/Menu';
import { createStyledComponent } from 'mineral-ui/styles';
import Text from 'mineral-ui/Text';
import TextInput from 'mineral-ui/TextInput';
import { arrayOf, func, shape, string } from 'prop-types';
import React, { Component } from 'react';

export default class List extends Component {
  static propTypes = {
    notes: arrayOf(
      shape({
        id: string.isRequired,
        text: string.isRequired,
        timeLastUpdated: string.isRequired
      })
    ),
    selectedNoteId: string,
    onSelect: func
  };

  static defaultProps = {
    onSelect: noop
  };

  state = { searchTerm: '' };

  render() {
    let notes = Array.isArray(this.props.notes) ? this.props.notes : [];

    const isSearching = !isEmpty(this.state.searchTerm);

    if (isSearching) {
      notes = notes.filter(note =>
        new RegExp(this.state.searchTerm).test(note.text)
      );
    }

    notes = orderBy(notes, 'timeLastUpdated', 'desc');

    return (
      <Container className={List.name} direction="column">
        <FlexItem className={`${List.name}-header`}>
          <TextInput
            placeholder="Search..."
            disabled={notes.length <= 1 && !isSearching}
            value={this.state.searchTerm}
            onChange={this._handleSearchTermChanged}
          />
        </FlexItem>
        <FlexItem className={`${List.name}-body`} grow={1} shrink={0}>
          {notes.length === 0 ? (
            <Text className={`${List.name}-emptyMessage`}>0 notes</Text>
          ) : (
            <Menu>
              {notes.map(note => (
                <MenuItem
                  className={`${List.name}-item`}
                  key={note.id}
                  secondaryText={new Date(
                    note.timeLastUpdated
                  ).toLocaleString()}
                  isHighlighted={note.id === this.props.selectedNoteId}
                  onClick={this._handleItemClicked.bind(this, note.id)}>
                  {extractTitle(note.text)}
                </MenuItem>
              ))}
            </Menu>
          )}
        </FlexItem>
      </Container>
    );
  }

  _handleItemClicked = (noteId, event) => {
    this.props.onSelect(noteId);

    if (!isEmpty(this.state.searchTerm)) {
      this.setState({ searchTerm: '' });
    }
  };

  _handleSearchTermChanged = event => {
    this.setState({ searchTerm: get(event, 'target.value', '') });
  };
}

var Container = createStyledComponent(
  Flex,
  ({ props }) => css`
    .${List.name}-header {
      padding: 10px;
    }

    .${List.name}-body {
      ${get(props, 'notes.length', 0) > 0
        ? `
      height: 1px;
      padding-top: 10px;
      `
        : ''}
    }

    .${List.name}-emptyMessage {
      padding: 8px 16px;
      font-style: italic;
    }

    .${List.name}-item {
      span > span > span:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 200px;
      }
    }
  `
);

function extractTitle(markdown) {
  const matches = /^#(.+)\n/.exec(markdown);
  if (!Array.isArray(matches) || matches.length === 0) return 'Untitled';
  return matches[1].trim();
}
