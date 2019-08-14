import React, {Component} from 'react';
//import {db, getMessages} from './fire';
import matchSorter from 'match-sorter'
import Loader from 'react-loader-spinner'
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import {CSVLink} from "react-csv";
import axios from 'axios'

import {db, getMessages} from './fire';
import ls from 'local-storage'

var he = require('he');


export default class Table extends Component {

state = {
    pagination: 21,
    table: db.collection(this.props.value).limit(20),
    rows: [],
    timeRow: {},
    count:0,
    loading: true,
    firstLoad: undefined,
    resp: undefined,
    running: false,
    lastUpdated : undefined,
    tableRows :{},
    updateTable: db.collection('updated'),
    last : undefined
    }

    
  componentWillMount(){
    let state = this.state

    let tableRows = []
    this.state.updateTable.get().then((snapshot) => {
        snapshot.forEach(doc => {
          tableRows.push ( doc.data().obj.time)
          })
      }).then(res => {
        tableRows = tableRows.sort(this.sortDatesDesc)
        //this.state.lastUpdated = rows[0]
        var lastUpdate = tableRows[0]

        state.lastUpdated = lastUpdate
        state.loading = false;
        console.log(this.state.lastUpdated)            
      })

    state.loading = true
      
    this.readQueryBatch(0)
  
  }

  componentDidMount(){
    //listen for updates
    let tableRows = []
    this.state.updateTable
    .onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(change => {
      if (change.type === 'added' || change.type === 'modified' ) {
        this.state.lastUpdated = change.doc.data();
        tableRows.push(change.doc.data().obj.time)
      }
      tableRows = tableRows.sort(this.sortDatesDesc)

      })
      if (tableRows.length > 0) {
        this.state.lastUpdated = tableRows[0]
      }
    })
  }

  sortDatesDesc = (date1, date2) => {
      var dateA = new Date(date1).getTime();
      var dateB = new Date(date2).getTime();
      return dateB > dateA ? 1 : -1; 
  }


  getDate = (date) => {
    var mydate = new Date(date);
    return mydate.toLocaleString();
  }

  onClick = async() => {
    console.log("running")
    let state = this.state
    state.running = true;
    this.setState(state)

    await axios.get('https://us-central1-expanded-system-245021.cloudfunctions.net/function-1 ').then(async resp => {
      this.setState()
       await axios.get('https://us-central1-expanded-system-245021.cloudfunctions.net/crawl-firestore')

    })
    .then(async resp => {
      await axios.get('https://us-central1-expanded-system-245021.cloudfunctions.net/crawl-firestore-guide')
      state.running = false;
      this.setState(state)
      }
    )
  }

  async readQueryBatch(startpoint, resolve, reject) {
    let collectionRef = db.collection(this.props.value)
    let query = collectionRef.orderBy('__name__').limit(2000);
    let rows = this.state.rows
    let more = []
    let length = undefined
    if (startpoint > 0) {
        query = query.startAfter(this.state.last)
    }
    const snapshot = await query.get();
    length = snapshot.docs.length;
    this.state.last = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach((doc) => {
      let row = doc.data().obj;
      row.key = doc.id;
      more.push(row);
    });
    if (length == 0) {
      return;
    }
    const res = rows;
    startpoint += 500;
    console.log(startpoint);
    process.nextTick(() => {
      this.readQueryBatch(startpoint, resolve, reject);
    });
    rows = rows.concat(more)

    if (this.props.value === "cards") {
      if (ls.get('cards').length === 0) {
        ls.set('cards', rows)
      }
      console.log(ls.get('cards'))
      this.setState({ rows: ls.get('cards') });    
    }
    else {
      this.setState({ rows: rows });  
    }
  }

 getTable () {

    const {rows} = this.state
    return(

      <div>    
        <div className="btn-group btn-group-sm"  class="text-right">
          <button className="btn btn-light btn-sm align-left">
            <i class="fas fa-info-circle"></i> Last Crawled {this.state.lastUpdated}
          </button>
          <button class="runCrawl" onClick={this.onClick} className="btn btn-light btn-sm align-left">
          <i class="fas fa-redo"></i>
            Rerun Crawl
          </button>
          <button class="exportButton" className="btn btn-light btn-sm align-left">
            <i class="fas fa-file-download"></i>
            <CSVLink data={rows} >
              Export to CSV
            </CSVLink>
          </button>
        </div>
      <div>
      <ReactTable

        data={rows}
        filterable
        defaultFilterMethod={(filter, row) =>
          String(row[filter.id]) === filter.value}
        columns={[
          {
            Header: "Results",
            columns: [
              {
                Header: "Product ID",
                accessor: "product_id",
                //show: (this.props.value === "cards") ? true : false,
                filterMethod: (filter, row) =>
                  row[filter.id].startsWith(filter.value)
              },
              {
                Header: "Card Name",
                accessor: "card_name",
                show: (this.props.value === "unavailable") ? false : true,
                Cell: ({ row }) => (
                  <a class="tpgLink" href={row.target}>{he.decode(row.card_name)}</a>),
                filterMethod: (filter, row) =>
                  row[filter.id].toLowerCase().includes(filter.value.toLowerCase())
              },
              {
                Header: "Issuer",
                accessor: "issuer",
                show: (this.props.value === "unavailable") ? false : true,
                filterMethod: (filter, row) =>
                  row[filter.id].toLowerCase().startsWith(filter.value.toLowerCase())
              },
              {
                Header: "Link Text",
                accessor: "link_text",
              },
              {
                Header: "URL",
                id: "url",
                accessor: "url",
                Cell: ({ row }) => (
                  <a class="tpgLink" href={row.url}>{row.url}</a>),
                filterMethod: (filter, rows) =>
                  matchSorter(rows, filter.value, { keys: ["url"] }),
                filterAll: true
              },
              {
                Header: "Target URL",
                accessor: "target",
                Cell: ({ row }) => (
                  <a class="tpgLink" href={row.target}>{row.target}</a>),
                filterMethod: (filter, row) =>
                  row[filter.id].toLowerCase().includes("https://thepointsguy.com/" + filter.value.toLowerCase())
              },
              {
                Header: "Last Updated",
                accessor: "last_modified",
                Cell: ({row}) => (
                  <tr>{this.getDate(row.last_modified)}</tr>
                ),
                filterMethod: (filter, row) =>
                  row[filter.id].startsWith(filter.value) &&
                  row[filter.id].endsWith(filter.value)
              },
            ]
          }
        ]}
        defaultPageSize={20}
        style={{
          height: "700px" // This will force the table body to overflow and scroll, since there is not enough room
        }}
        className="-striped -highlight"
      />
    </div>
    </div>
  )
}

render() {


  const {loading, running, resp  } = this.state;

  let status = () => {

    if (running) {
    return       <Loader
                  type="ThreeDots"
                  color="#00ffc6"
                  height="100"
                  width="100"
              />
  }

}
  if ((typeof(this.state.rows) == "undefined") || Object.keys(this.state.rows).length === 0 && loading) {
    return(

       <Loader
          type="ThreeDots"
          color="#00ffc6"
          height="100"
          width="100"
       />
     );
  }
  else {
    return (
      
          <div>
          {status()}
          {this.getTable()} 
          </div>
      );
    }
  }
}
