import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import NavBar from './NavBar/NavBar';
import Search from './Search/Search';
import Company from './Company/Company';
import Home from './Home/Home';
import './Flatly.css';


class App extends Component{
  render() {
    return (
      <div>
        <Route exact path='/home' component={Home} />
        <Route path='/nav' component={NavBar} />
        <Route exact path='/nav/search/:searchTarget' component={Search} />
        <Route exact path='/nav/:companyName' component={Company} />
      </div>
    )
  }
}

export default App;
