import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { listReservations } from "../utils/api";
import { today, previous, next } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
import axios from 'axios';

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ curDate }) {
  /*const months = {
    1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
  }*/
  let x;
  const location = useLocation();
  location.search ? x = location.search.slice(6) : x = curDate;

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [date, setDate] = useState(x);
  const history = useHistory();
  

  /*useEffect(() => {
    //console.log(location.pathname); // result: '/secondpage'
    //console.log(location.search); // result: '?query=abc'
    //console.log(location.state); // result: 'some_value'
    if (location.search) {
      let queryName = location.search.slice(1, 5);
      if (queryName === "date") {
        try {
          let queryDate = location.search.slice(6);
          //console.log(queryDate);
          setDate(queryDate);
        } catch (err) {
          alert("Invalid Date");
        }
      }
    }
  }, [location]);*/
  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    console.log(date);
    //console.log(location);
    console.log(location.search);
    /*if (location.search) {
      let queryName = location.search.slice(1, 5);
      if (queryName === "date") {
        try {
          let queryDate = location.search.slice(6);
          //console.log(queryDate);
          setDate(queryDate);
        } catch (err) {
          alert("Invalid Date");
        }
      }
    }*/
    //Working Below
    /*if (location.search) {
      let queryDate = location.search.slice(6);
      const abortController = new AbortController();
      setReservationsError(null);
      listReservations({ date: queryDate }, abortController.signal)
        .then((res) => {
          //console.log(res)
          setReservations(res)
        })
        .catch(setReservationsError);
      return () => abortController.abort();
    } else {*/
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

  /*function loadDashboard2() {
    axios.get('http://localhost:5000/reservations')
    .then(res => {
      console.log(res.data.data)
      setReservations(res.data.data);
    })
    .catch(setReservationsError)
  }*/

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
          <div key={Math.random()}>
            <p>First name: {res.first_name}</p>
            <p>Last name: {res.last_name}</p>
            <p>Phone: {res.mobile_number}</p>
            <br/>
          </div>
        )
      }) : ""}
      <div>
        <button onClick={() => alterQuery("prev")}>Previous</button>
        {/*<button onClick={() => setDate(previous(date))}>Previous</button>*/}
        <button onClick={() => alterQuery()}>Today</button>
        <button onClick={() => alterQuery("next")}>Next</button>
      </div>
    </main>
  );
}

export default Dashboard;
