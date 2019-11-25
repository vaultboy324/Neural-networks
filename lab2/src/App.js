import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Page from "./components/page/Page";

class App extends Component {
  render() {
    return (
      <div>
          <Page/>
          {/*<Page/>*/}
      </div>
    );
  }
}

export default App;
