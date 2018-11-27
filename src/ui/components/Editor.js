import { css } from 'emotion';
import get from 'lodash.get';
import has from 'lodash.has';
import noop from 'lodash.noop';
import IconEdit from 'mineral-ui-icons/IconEdit';
import IconRemoveRedEye from 'mineral-ui-icons/IconRemoveRedEye';
import Button from 'mineral-ui/Button';
import ButtonGroup from 'mineral-ui/ButtonGroup';
import Flex, { FlexItem } from 'mineral-ui/Flex';
import Popover from 'mineral-ui/Popover';
import { createStyledComponent } from 'mineral-ui/styles';
import Text from 'mineral-ui/Text';
import { func, oneOf, shape, string } from 'prop-types';
import React, { Component, Fragment } from 'react';
import Markdown from 'react-markdown';

export const MODE_EDIT = 'EDIT';
export const MODE_READ = 'READ';

export default class Editor extends Component {
  static propTypes = {
    note: shape({
      id: string.isRequired,
      text: string.isRequired,
      timeLastUpdated: string.isRequired
    }),
    mode: oneOf([MODE_EDIT, MODE_READ]),
    onSave: func,
    onDelete: func
  };

  static defaultProps = {
    onSave: noop,
    onDelete: noop
  };

  state = {
    text: get(this.props, 'note.text', ''),
    mode: this.props.mode || MODE_EDIT
  };

  render() {
    return (
      <Container className={Editor.name} direction="column">
        <FlexItem
          className={`${Editor.name}-header`}
          flex
          alignItems="center"
          justifyContent="between">
          <FlexItem alignItems="center">
            <ButtonGroup
              aria-label="Mode"
              mode="radio"
              onChange={this._handleModeOptionChanged}>
              <Button
                name="mode"
                value={MODE_EDIT}
                aria-label="Edit"
                iconEnd={<IconEdit />}
                defaultChecked={this.state.mode === MODE_EDIT}
              />
              <Button
                name="mode"
                value={MODE_READ}
                aria-label="Read"
                iconEnd={<IconRemoveRedEye />}
                defaultChecked={this.state.mode === MODE_READ}
              />
            </ButtonGroup>
          </FlexItem>
          <FlexItem flex alignItems="center">
            {has(this.props, 'note.id') ? (
              <Text className={`${Editor.name}-timestamp`} noMargins>
                {`Last saved at ${new Date(
                  this.props.note.timeLastUpdated
                ).toLocaleString()}`}
              </Text>
            ) : null}
            <Button
              className={`${Editor.name}-saveButton`}
              disabled={this._isTextEmpty || !this.hasTextChanged}
              onClick={this._handleSaveButtonClicked}>
              Save
            </Button>
            {has(this.props, 'note.id') ? (
              <Fragment>
                {/* <Button
                  className={`${Editor.name}-discardButton`}
                  variant="warning"
                  disabled={this._isTextEmpty || !this.hasTextChanged}
                  onClick={this._handleDiscardButtonClicked}>
                  Discard
                </Button> */}
                <Popover
                  placement="bottom-end"
                  title="Are you sure?"
                  isOpen={this.state.showDeleteConfirmation}
                  onClose={this._handleCloseDeleteConfirmation}
                  content={
                    <Fragment>
                      <Text>
                        If you proceed, this note will be permanently deleted.
                      </Text>
                      <Flex>
                        <FlexItem grow={1}>
                          <Button
                            fullWidth
                            onClick={this._handleDeleteCancelButtonClicked}>
                            Cancel
                          </Button>
                        </FlexItem>
                        <FlexItem grow={1}>
                          <Button
                            primary
                            variant="danger"
                            fullWidth
                            onClick={this._handleDeleteProceedButtonClicked}>
                            Proceed
                          </Button>
                        </FlexItem>
                      </Flex>
                    </Fragment>
                  }>
                  <Button
                    className={`${Editor.name}-deleteButton`}
                    variant="danger"
                    onClick={this._handleDeleteButtonClicked}>
                    Delete
                  </Button>
                </Popover>
              </Fragment>
            ) : null}
          </FlexItem>
        </FlexItem>
        <FlexItem
          className={`${Editor.name}-body`}
          grow={1}
          shrink={0}
          flex
          direction="column">
          {this.state.mode === MODE_EDIT ? (
            <textarea
              className={`${Editor.name}-textInput`}
              defaultValue={get(this.state, 'text', '')}
              placeholder={'Start typing here...\n\nMarkdown supported :)'}
              onChange={this._handleTextInputChanged}
            />
          ) : (
            <Markdown
              className={`${Editor.name}-preview`}
              source={get(this.state, 'text', '')}
            />
          )}
        </FlexItem>
      </Container>
    );
  }

  get hasTextChanged() {
    return get(this.props, 'note.text', '') !== get(this.state, 'text', '');
  }

  get _isTextEmpty() {
    return get(this.state, 'text.length', 0) === 0;
  }

  _handleTextInputChanged = event => {
    const text = get(event, 'target.value', '');
    this.setState({ text });
  };

  _handleModeOptionChanged = event => {
    const mode = get(event, 'target.value', '');
    this.setState({ mode });
  };

  _handleSaveButtonClicked = event => {
    this.props.onSave({
      ...(has(this.props, 'note.id') ? { id: this.props.note.id } : {}),
      text: get(this.state, 'text', '')
    });
  };

  _handleDeleteButtonClicked = event => {
    this.setState({ showDeleteConfirmation: true });
  };

  _handleCloseDeleteConfirmation = event => {
    this.setState({ showDeleteConfirmation: false });
  };

  _handleDeleteCancelButtonClicked = event => {
    this.setState({ showDeleteConfirmation: false });
  };

  _handleDeleteProceedButtonClicked = event => {
    this.setState({ showDeleteConfirmation: false }, () => {
      this.props.onDelete(get(this.props, 'note.id'));
    });
  };

  static MODE_EDIT = MODE_EDIT;
  static MODE_READ = MODE_READ;
}

var Container = createStyledComponent(
  Flex,
  ({ theme }) => css`
    height: 100%;
    overflow: hidden;

    .${Editor.name}-header {
      background-color: ${theme.color_gray_10};
      border-bottom: 1px solid ${theme.borderColor};
      padding: 10px;
    }

    .${Editor.name}-timestamp {
      font-size: 0.8em;
    }

    .${Editor.name}-saveButton,
      .${Editor.name}-discardButton,
      .${Editor.name}-deleteButton {
      margin-left: 5px;
      width: 90px;
    }

    .${Editor.name}-saveButton {
      margin-left: 10px;
    }

    .${Editor.name}-body {
      height: 1px;
    }

    .${Editor.name}-textInput {
      border: 0;
      flex: 1;
      font-family: monospace;
      font-size: 1.25em;
      outline: 0;
      padding: 10px;
      resize: none;
      width: 100%;
    }

    .${Editor.name}-preview {
      overflow: auto;
      padding: 10px;

      > :first-child {
        margin-top: 0;
      }

      code {
        background-color: whitesmoke;
        border: 1px solid silver;
        border-radius: 5px;
        display: block;
        padding: 10px;
      }
    }
  `
);
