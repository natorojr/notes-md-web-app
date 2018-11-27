import { css } from 'emotion';
import get from 'lodash.get';
import noop from 'lodash.noop';
import IconAddCircleOutline from 'mineral-ui-icons/IconAddCircleOutline';
import IconMenu from 'mineral-ui-icons/IconMenu';
import Box from 'mineral-ui/Box';
import Button from 'mineral-ui/Button';
import Dialog from 'mineral-ui/Dialog';
import Flex, { FlexItem } from 'mineral-ui/Flex';
import Popover from 'mineral-ui/Popover';
import { createStyledComponent } from 'mineral-ui/styles';
import Text from 'mineral-ui/Text';
import TextInput from 'mineral-ui/TextInput/TextInput';
import { arrayOf, func, shape, string } from 'prop-types';
import React, { Component } from 'react';
import Editor from './Editor';
import List from './List';

export default class MainPage extends Component {
  static propTypes = {
    notes: arrayOf(
      shape({
        id: string.isRequired,
        text: string.isRequired,
        timeLastUpdated: string.isRequired
      })
    ),
    lastSavedNoteId: string,
    onSaveNote: func,
    onDeleteNote: func
  };

  static defaultProps = {
    onSaveNote: noop,
    onDeleteNote: noop
  };

  _editorRef = React.createRef();

  state = { showList: false };

  static getDerivedStateFromProps(props, state) {
    const prevProps = state.prevProps || {};
    const stateChanges = {};

    if (props.notes !== prevProps.notes) {
      const count = get(props, 'notes.length', 0);
      const prevCount = get(prevProps, 'notes.length', 0);

      // handle auto-open and auto-close of list
      if (state.showList && count === 0) {
        stateChanges.showList = false;
      } else if (!state.showList && count > 0) {
        stateChanges.showList = true;
      }

      if (count > prevCount) {
        stateChanges.selectedNoteId = props.lastSavedNoteId;
      } else if (count < prevCount) {
        stateChanges.selectedNoteId = generateResetKey();
      }
    }

    stateChanges.prevProps = props;
    return stateChanges;
  }

  render() {
    const notes = Array.isArray(this.props.notes) ? this.props.notes : [];
    const showListButton = notes.length > 0;
    const selectedNote = this._getSelectedNote(notes);

    return (
      <Container className={MainPage.name} direction="column">
        <FlexItem
          className={`${MainPage.name}-header`}
          flex
          justifyContent="between">
          <FlexItem>
            {showListButton ? (
              <Button
                className={[
                  `${MainPage.name}-listButton`,
                  ...(this.state.showList ? ['on'] : [])
                ].join(' ')}
                primary
                minimal
                iconEnd={<IconMenu />}
                onClick={this._handleListButtonClicked}
              />
            ) : null}
            <Button
              primary
              minimal
              iconStart={<IconAddCircleOutline />}
              onMouseDown={this._handleNewButtonClicked}>
              New Note
            </Button>
          </FlexItem>
          <FlexItem alignSelf="center">
            {/* <img src="/logo.svg" alt="nt" height={30} /> */}
            <Text className={`${MainPage.name}-logo`} noMargins>
              #notes.md
            </Text>
          </FlexItem>
          <FlexItem>
            <Popover
              placement="bottom-end"
              content={
                <Box className={`${MainPage.name}-signInForm`}>
                  <TextInput placeholder="Username" />
                  <TextInput placeholder="Password" />
                  <Button primary minimal fullWidth>
                    Sign In
                  </Button>
                </Box>
              }>
              <Button primary minimal>
                Sign In
              </Button>
            </Popover>
          </FlexItem>
        </FlexItem>
        <FlexItem className={`${MainPage.name}-body`} grow={1} shrink={0} flex>
          {showListButton && this.state.showList ? (
            <FlexItem
              className={`${MainPage.name}-listWrapper`}
              marginRight={0}
              flex>
              <List
                notes={notes}
                selectedNoteId={get(selectedNote, 'id')}
                onSelect={this._handleSelectNote}
              />
            </FlexItem>
          ) : null}
          <FlexItem
            className={`${MainPage.name}-editorWrapper`}
            grow={1}
            shrink={0}>
            <Editor
              key={this.state.selectedNoteId}
              ref={this._editorRef}
              note={selectedNote}
              // mode={isEmpty(selectedNote) ? Editor.MODE_EDIT : Editor.MODE_READ}
              onSave={this._handleSaveNote}
              onDelete={this._handleDeleteNote}
            />
          </FlexItem>
        </FlexItem>
        <Dialog
          appSelector={`.${MainPage.name}`}
          title="Unsaved Changes"
          variant="warning"
          isOpen={this.state.showWarning}
          actions={[
            {
              onClick: this._handleWarningCancelButtonClicked,
              text: 'Cancel'
            },
            {
              onClick: this._handleWarningProceedButtonClicked,
              text: 'Proceed'
            }
          ]}
          onClose={this._handleWarningCancelButtonClicked}>
          <Text>
            There are unsaved changes in the editor. If you proceed, those
            changes will be discarded. Alternatively, you can cancel and save
            your changes.
          </Text>
        </Dialog>
      </Container>
    );
  }

  _getSelectedNote(notes) {
    return notes.find(note => note.id === this.state.selectedNoteId);
  }

  _handleListButtonClicked = event => {
    this.setState(currentState => ({
      showList: !currentState.showList
    }));
  };

  _handleNewButtonClicked = event => {
    const newSelectedNoteId = generateResetKey();

    if (get(this._editorRef, 'current.hasTextChanged')) {
      this.setState({ showWarning: true, newSelectedNoteId });
      return;
    }

    this.setState({ selectedNoteId: newSelectedNoteId });
  };

  _handleSaveNote = note => {
    this.props.onSaveNote(note);
  };

  _handleDeleteNote = noteId => {
    this.props.onDeleteNote(noteId);
  };

  _handleSelectNote = noteId => {
    if (noteId === this.state.selectedNoteId) return;

    if (get(this._editorRef, 'current.hasTextChanged')) {
      this.setState({ showWarning: true, newSelectedNoteId: noteId });
      return;
    }

    this.setState({ selectedNoteId: noteId });
  };

  _handleWarningCancelButtonClicked = () => {
    if (this.state.showWarning === false) return;

    this.setState(currentState => ({
      showWarning: false,
      newSelectedNoteId: undefined
    }));
  };

  _handleWarningProceedButtonClicked = () => {
    this.setState(currentState => ({
      showWarning: false,
      selectedNoteId: currentState.newSelectedNoteId,
      newSelectedNoteId: undefined
    }));
  };
}

var Container = createStyledComponent(
  Flex,
  ({ theme }) => css`
    height: 100%;
    width: 100%;

    .${MainPage.name}-header {
      background-color: ${theme.backgroundColor_themePrimary};
      padding: 10px 10px 10px 5px;

      button:focus {
        border-color: transparent;
      }
    }

    .${MainPage.name}-logo {
      color: ${theme.color_theme_40};
      display: block;
      font-family: monospace;
      font-size: 1.4em;
      font-weight: bold;
    }

    .${MainPage.name}-signInForm {
      > *:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    .${MainPage.name}-listButton {
      margin-right: 10px;

      &.on {
        background-color: ${theme.backgroundColor_themePrimary_hover};
      }
    }

    .${MainPage.name}-body {
      height: 1px;
    }

    .${MainPage.name}-listWrapper {
      background-color: ${theme.color_gray_30};

      .List {
        min-width: 360px;
      }
    }

    .${MainPage.name}-editorWrapper {
      border-left: 1px solid ${theme.borderColor};
    }
  `
);

/*
const animation = keyframes`
  from {
    transform: translateX(-100px)
  }
  to {
    transform: translateX(0)
  }
`;
*/

function generateResetKey() {
  return `reset-${Date.now()}`;
}
