import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// import Table from "./Components/Based_components/Table/Table";

import ColorsTable from "./Components/ColorsTable/ColorsTable";

import Page from './Components/Page/Page'

class App extends Component {
  render() {
    return (
      <div>
          <ColorsTable/>
          {/*<Page/>*/}
      </div>
    );
  }
}

export default App;
