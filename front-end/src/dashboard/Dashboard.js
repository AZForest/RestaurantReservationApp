import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from 'react-router-dom';
import { listReservations } from "../utils/api";
import { previous, next } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
import axios from 'axios';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ curDate }) {

  const location = useLocation();
  const x = location.search ? location.search.slice(6) : curDate;

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableFinishDivs, setTableFinishDivs] = useState({});
  const [date, setDate] = useState(x);
  const history = useHistory();
  
  useEffect(loadDashboard, [date]);
  useEffect(() => {
    axios.get(`${BASE_URL}/tables`)
    .then(res => {
      console.log(res.data.data);
      setTables(res.data.data);
    })
    .catch(err => console.log(err))

    /*const hash = {}
    tables.forEach(table => {
      console.log(table.table_id);
      hash[`${table.table_id}`] = false;
    })
    console.log(hash);
    setTableFinishDivs(hash);*/
  }, [])




  function loadDashboard() {
    //console.log(date);
    //console.log(location);
    //console.log(location.search);
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then((res) => {
        //console.log(res)
        setReservations(res)
      })
      .catch(setReservationsError);
    return () => abortController.abort();
    //}
  }

  function alterQuery(val) {
    if (val === "prev") {
      const prevDate = previous(date);
      //location.search = `?date=${prevDate}`;
      setDate(prevDate);
      history.push({
        pathname: `/dashboard`,
        search: `?date=${prevDate}`
      })
    } else if (val === "next") {
      const nextDate = next(date);
      //location.search = `?date=${nextDate}`;
      setDate(nextDate);
      history.push({
        pathname: `/dashboard`,
        search: `?date=${nextDate}`
      })
    } else {
      location.search = ``;
      setDate(curDate);
    }
  }

  function clickFinish(table_id) {
    console.log(table_id);
    let newHash = { ...tableFinishDivs };
    newHash[`${table_id}`] = !newHash[`${table_id}`];
    console.log(newHash);
    setTableFinishDivs(newHash);
  }

  function deleteHandler(table_id) {
    axios.delete(`${BASE_URL}/tables/${table_id}/seat`)
    .then(res => {
      console.log(res);
      let updatedTables = [ ...tables ];
      let updateIndex = updatedTables.findIndex(table => table.table_id === table_id);
      updatedTables[updateIndex].reservation_id = null;
      setTables(updatedTables);
    })
    .catch(err => {
      console.log(err);
    })
  }

  let tablesDiv = (
    <div>
      <h4>Tables</h4>
      {tables.map(table => {
        return (
          <div className="m-3" style={{backgroundColor: "lightblue"}} key={table.table_id}>
            <p>Table Name: {table.table_name}</p>
            <p>Capacity: {table.capacity}</p>
            {table.reservation_id ? 
            <p data-table-id-status={table.table_id}>Occupied</p>
            : <p data-table-id-status={table.table_id}>Free</p>}
            {table.reservation_id ?
            <button data-table-id-status={table.table_id} onClick={() => clickFinish(table.table_id)}>Finish</button>
            : ""}
            {tableFinishDivs[`${table.table_id}`] ?
            <div>
              <button onClick={() => deleteHandler(table.table_id)}>Ok</button>
              <button onClick={() => clickFinish(table.table_id)}>Cancel</button>
            </div>
            : ""}
          </div>
        )
      })}
    </div>
  )

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      {/*JSON.stringify(reservations)*/}
      {reservations ? reservations.map(res => {
        return (
          <div key={Math.random()} style={{backgroundColor: "gainsboro"}}>
            <p>Reservation id: {res.reservation_id}</p>
            <p>First name: {res.first_name}</p>
            <p>Last name: {res.last_name}</p>
            <p>Phone: {res.mobile_number}</p>
            <p>Time: {res.reservation_time}</p>
            <p>People: {res.people}</p>
            <Link to={`/reservations/${res.reservation_id}/seat`}>Seat</Link>
            <br/>
          </div>
        )
      }) : ""}
      <div className="m-3">
        <button onClick={() => alterQuery("prev")}>Previous</button>
        {/*<button onClick={() => setDate(previous(date))}>Previous</button>*/}
        <button onClick={() => alterQuery()}>Today</button>
        <button onClick={() => alterQuery("next")}>Next</button>
      </div>
      {tables ? tablesDiv : ""}
    </main>
  );
}

export default Dashboard;
