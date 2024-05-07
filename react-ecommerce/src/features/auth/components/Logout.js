import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLoggedInUser, signOutAsync } from "../authSlice";
import { Navigate } from "react-router-dom";

function Logout() {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);

  useEffect(() => {
    dispatch(signOutAsync());
  });

  return <div>{!user && <Navigate to="/" replace={true}></Navigate>}</div>;
}

export default Logout;
