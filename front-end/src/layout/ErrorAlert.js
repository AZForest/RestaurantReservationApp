import React from "react";

/**
 * Defines the alert message to render if the specified error is truthy.
 * @param error
 *  an instance of an object with `.message` property as a string, typically an Error instance.
 * @returns {JSX.Element}
 *  a bootstrap danger alert that contains the message string.
 */

function ErrorAlert({ error }) {
  if (error) {
    //Client validation
    if (Array.isArray(error)) {
        return <div className="alert alert-danger m-2">
          {error.map(err => <div key={Math.random()}>Error: {err.message}</div>)}
        </div>
    } else if (error.message) {
      return (
        <div className="alert alert-danger m-2">Error: {error.message}</div>
      )
    } else {
      //Server Validation
      return (
        error && (
          <div className="alert alert-danger m-2">Error: {error.response.data.error}</div>
        )
      );
    }
  } else {
    return "";
  }
}

export default ErrorAlert;
