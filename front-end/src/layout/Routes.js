import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NewReservation from "../reservations/newReservation";
import NewTable from "../tables/newTable";
import SeatReservation from "../reservations/seatReservation";
import SearchByPhoneNumber from "../search/searchByPhoneNumber";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={'/dashboard'} />
      </Route>
      {/*<Route exact={true} path="/reservations">
        <Dashboard curDate={today()} />
    </Route>*/}
      <Route path="/reservations/new">
        <NewReservation text={"text"}/>
      </Route>
      <Route path="/reservations/:reservationId/seat">
        <SeatReservation />
      </Route>
      <Route path={`/dashboard`}>
        <Dashboard curDate={today()} />
      </Route>
      <Route path={`/tables/new`}>
        <NewTable />
      </Route>
      <Route>
        <SearchByPhoneNumber />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
