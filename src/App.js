import isEmpty from 'lodash.isempty';
import isObject from 'lodash.isobject';
import React, { Component } from 'react';
import { ulid } from 'ulid';
import MainPage from './ui/components/MainPage';

export default class App extends Component {
  state = { notesIndex: loadNotesIndex() };

  render() {
    const notes = isObject(this.state.notesIndex)
      ? Object.values(this.state.notesIndex)
      : [];

    return (
      <MainPage
        notes={notes}
        lastSavedNoteId={this.state.lastSavedNoteId}
        onSaveNote={this._handleSaveNote}
        onDeleteNote={this._handleDeleteNote}
      />
    );
  }

  _handleSaveNote = note => {
    if (!isObject(note)) return;

    note = {
      id: isEmpty(note.id) ? ulid() : note.id,
      timeLastUpdated: new Date().toISOString(),
      ...note
    };

    const notesIndex = { ...this.state.notesIndex };
    notesIndex[note.id] = note;
    persistNotesIndex(notesIndex);

    this.setState({
      lastSavedNoteId: note.id,
      notesIndex
    });
  };

  _handleDeleteNote = noteId => {
    if (isEmpty(noteId)) return;

    const notesIndex = { ...this.state.notesIndex };
    delete notesIndex[noteId];
    persistNotesIndex(notesIndex);

    this.setState({
      lastSavedNoteId: undefined,
      notesIndex
    });
  };
}

function loadNotesIndex() {
  const json = localStorage.getItem('notesIndex');
  return isEmpty(json) ? {} : JSON.parse(json);
}

function persistNotesIndex(notesIndex) {
  const json = JSON.stringify(notesIndex);
  localStorage.setItem('notesIndex', json);
}
