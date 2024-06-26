import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLoggedInUserOrdersAsync,
  selectUserInfo,
  selectUserOrders,
} from "../userSlice";
export default function UserOrders() {
  const dispatch = useDispatch();
  // const userInfo = useSelector(selectUserInfo);
  const orders = useSelector(selectUserOrders);

  useEffect(() => {
    dispatch(fetchLoggedInUserOrdersAsync());
  }, [dispatch]);

  return (
    <div>
      {orders &&
        orders.map((order, index) => (
          <div key={index}>
            {/* {!items.length && <Navigate to="/" replace={true}></Navigate>} */}
            <div className="mx-auto max-w-7xl px-4 bg-white sm:px-6 lg:px-8">
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <h1 className="text-lg lg:text-4xl font-bold tracking-tight my-3 text-gray-900">
                  Order # {order.id}
                </h1>
                <h3 className="text-lg md:text-xl font-bold tracking-tight my-2 text-red-500">
                  Order Status : {order.status}
                </h3>
                <hr className="my-5" />
                <div className="flow-root">
                  <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex py-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.title}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <a href={item.product.href}>
                                  {item.product.title}
                                </a>
                              </h3>
                              <p className="ml-4">${item.product.price}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.product.brand}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="text-gray-500">
                              <label
                                htmlFor="quantity"
                                className="inline text-sm font-medium leading-6 text-gray-900"
                              >
                                Qty : {item.quantity}
                              </label>
                            </div>

                            <div className="flex"></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6 my-3">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${order.totalAmount}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 my-3">
                  <p>Total Items in Cart</p>
                  <p>{order.totalItems}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping Address :
                </p>

                <div className="flex justify-between gap-x-6 py-5 border-2 px-2 border-gray-200 rounded-md my-1">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {order.selectedAddress.name}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {order.selectedAddress.email}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {order.selectedAddress.street} -{" "}
                        {order.selectedAddress.pinCode}
                      </p>
                    </div>
                  </div>
                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm leading-6 text-gray-900">
                      Phone: {order.selectedAddress.phone}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {order.selectedAddress.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
