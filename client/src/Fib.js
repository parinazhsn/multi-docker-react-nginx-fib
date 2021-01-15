import React, { Component } from 'react';
import axios from 'axios'; // making request to backend Express server

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
  };

  // fetch some data from our backend API
  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current'); // get list of values that stored on our API
    this.setState({ values: values.data }); // set my state on this component
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({
      seenIndexes: seenIndexes.data,
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post('/api/values', {
      index: this.state.index,
    });
    this.setState({ index: '' }); // after sending the index to the server, the index will be empty string
  };

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(', '); // return list of numbers on screen
  }

  renderValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }
  
  // rendering the data from backend on screen of our browser
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={(event) => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values:</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
