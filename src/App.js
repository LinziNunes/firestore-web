import React from 'react';
import logo from './logo.png';
import './App.css';
import Table from './components/Table'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import db from '/components/fire';


class App extends React.Component {

  componentDidMount() {
    const { requestData } = this.props;
    requestData();
  }

  render() {  
    const { result } = this.props;
    if (result && result.fetched) {
      const { fetching, error, successPayload } = result;
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
}

const enhance = connect(
  state => ({
    result: api.selectors.getResult(state, CACHE_KEY),
  }),
  dispatch => ({
    requestData() {
      return dispatch(
        api.actions.invoke({
          method: 'GET',
          headers: {
            Accept: 'application/json; charset=utf-8',
            'x-api-Key': process.env.REACT_APP_API_KEY,
          },
          endpoint: 'https://newsapi.org/v2/top-headlines?sources=hacker-news',
          cache: {
            key: CACHE_KEY,
            strategy: api.cache
              .get(api.constants.CACHE_TYPES.TTL_SUCCESS)
              .buildStrategy({ ttl: 600000 }), // 10 minutes
          },
        })
      );
    },
  })
);

App.propTypes = {
  result: PropTypes.shape({
    fetching: PropTypes.bool.isRequired,
    fetched: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    timestamp: PropTypes.number,
    successPayload: PropTypes.any,
    errorPayload: PropTypes.any,
  }),
  requestData: PropTypes.func.isRequired,
};


export default enhance(App);
