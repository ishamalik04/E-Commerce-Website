import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import { resetCartAsync } from "../features/cart/cartSlice";
import { selectLoggedInUser } from "../features/auth/authSlice";
import { resetOrder } from "../features/order/orderSlice";
import Navbar from "../features/Navbar/Navbar";

function OrderSuccessPage() {
  const params = useParams();
  const dispatch = useDispatch();
  // const user = useSelector(selectLoggedInUser);

  // console.log("Params are here ->", params);

  useEffect(() => {
    // reset cart
    dispatch(resetCartAsync());
    //  reset current order
    dispatch(resetOrder());
  }, [dispatch]);

  return (
    <div>
      {!params.id && <Navigate to="/" replace={true}></Navigate>}
      <Navbar></Navbar>
      <main className="grid min-h-full place-items-center bg-white px-6 -mt-10 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">
            Order Successfully Placed
          </p>
          <h1 className="mt-4 text-lg md:text-2xl flex font-bold tracking-tight text-gray-900 lg:text-4xl">
            Order Number : #{params?.id}
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            You can check your order in My Account &rarr; My Orders
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back home
            </Link>
            <Link
              to="/contact"
              className="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Contact support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccessPage;
