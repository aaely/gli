import React, { Component } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Websocket from 'react-websocket';
import PropTypes from 'prop-types';


class WebsocketTest extends Component {
  constructor(props) {
    super(props);
      this.state = {
        message: '',
        count: 90
      };
  }

  handleData = (data) => {
    let result = JSON.parse(data);
    this.setState({count: this.state.count + result.movement});
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render() {
    return (
      <div>
        <Websocket url='ws://nv-dt-534:3000/sockjs-node/335/xlxqs3dt/websocket' onMessage={this.handleData.bind(this)} />
        <form
        action="."
        onSubmit={e => {
          e.preventDefault()
          this.props.onSubmitMessage(this.state.message)
          this.setState({ message: '' })
          }}
        >
        <input
          type="text"
          placeholder={'Enter message...'}
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
        />
        <input type="submit" value={'Send'} />
      </form>
      </div>
    );
  }
}

export default WebsocketTest;