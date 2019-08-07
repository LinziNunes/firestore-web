import React from 'react';
import logo from './logo.png';
import './App.css';
import Table from './components/Table'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class App extends React.Component {

  render() {  
  return (
    <div className="App" >
    <Router>

    <nav className="navbar sticky-top navbar-expand-lg navbar-custom ">
           <a class="navbar-brand" href="thepointsguy.com" target="_blank">
             <img src={logo} width="30" height="30" alt="thepointsguy.com" />
           </a>
           <Link to="/" className="navbar-brand">TPG Compliance Tool</Link>
           <div className="collpase navbar-collapse">
             <ul className="navbar-nav mr-auto">
               <li className="navbar-item">
                 <Link to="/" class="header" className="nav-link">Card Mentions</Link>
               </li>
               <li className="navbar-item">
                 <Link to="/reviews" className="nav-link">Card Details</Link>
               </li>
               <li className="navbar-item">
                 <Link to="/not-available" className="nav-link">Offer Unavailable</Link>
               </li>
             </ul>
           </div>
         </nav>
         <Route exact path="/" component={() => <Table value="cards"/>} />
         <Route path="/reviews" component={() => <Table value="reviews"/>}/>
         <Route path="/not-available" component={() => <Table value="unavailable"/>}/>
      </Router>
    </div>
  );
}

}


export default App;
