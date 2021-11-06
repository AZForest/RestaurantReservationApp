import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from 'react-router-dom';
import { listReservations } from "../utils/api";
import { previous, next } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
import axios from 'axios';

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
  const [date, setDate] = useState(x);
  const history = useHistory();
  
  useEffect(loadDashboard, [date]);
  useEffect(() => {
    axios.get(`http://localhost:5000/tables`)
    .then(res => {
      //console.log(res);
      const sortedTables = res.data.data.sort((a, b) => {
        if (a.table_name >= b.table_name) return 1;
        else return -1;
      })
      setTables(sortedTables);
    })
    .catch(err => console.log(err))
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

  /*function switchDate(e, day) {
    if (day === "Previous") {
      let dateVals = date.split("-")
      //2011-12-01
      console.log(dateVals);
      if (dateVals[2] === "1") {
        dateVals[1] = String(parseInt(dateVals[1]) - 1);
        dateVals[2] = String(months[parseInt(dateVals[1])]);
      } else {
        dateVals[2] = String(parseInt(dateVals[2]) - 1);
      }
      dateVals = dateVals.join("-");
      setDate(dateVals);
    } else if (day === "Next") {
      let dateVals = date.split("-")
      if (dateVals[2] === "31" || (dateVals[2] === "30" && months[parseInt(dateVals[1])] === 30)) {
        dateVals[1] = String(parseInt(dateVals[1]) + 1);
        dateVals[2] = "1";
      } else {
        dateVals[2] = String(parseInt(dateVals[2]) + 1);
      }
      dateVals = dateVals.join("-");
      setDate(dateVals);
    } else {
      setDate(curDate)
    }
  }*/
  let tablesDiv = (
    <div>
      <h4>Tables</h4>
      {tables.map(table => {
        return (
          <div style={{backgroundColor: "ghostwhite"}} key={table.table_id}>
            <p>Table Name: {table.table_name}</p>
            <p>Capacity: {table.capacity}</p>
            {table.reservation_id ? 
            <p data-table-id-status={table.table_id}>Occupied</p>
            : <p data-table-id-status={table.table_id}>Free</p>}
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
