import { Link, Navigate, useNavigate } from "react-router-dom";
import { updateUserAsync } from "../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteItemFromCartAsync,
  fetchItemsByUserIdAsync,
  selectItems,
  updateCartAsync,
} from "../features/cart/cartSlice";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createOrderAsync,
  selectCurrentOrder,
} from "../features/order/orderSlice";
import { selectUserInfo } from "../features/user/userSlice";
import { useAlert } from "react-alert";
import { loadStripe } from "@stripe/stripe-js";

function Checkout() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const items = useSelector(selectItems);
  const user = useSelector(selectUserInfo);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const navigate = useNavigate();
  const currentOrder = useSelector(selectCurrentOrder);
  const alert = useAlert();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const totalAmount = items.reduce(
    // TODO : This is major issue please check when products are comes back (time : 8:36:54)
    (amount, item) =>
      Math.round(
        item.product.price *
          (1 - item.product.discountPercentage / 100) *
          item.quantity +
          amount
      ),
    0
  );
  const totalItems = items.reduce((total, item) => item.quantity + total, 0);

  const handleQuantity = (e, item) => {
    // console.log("e is ->", e.target.value);
    // console.log("item is -> ", item);
    dispatch(updateCartAsync({ id: item.id, quantity: +e.target.value }));
    dispatch(fetchItemsByUserIdAsync(user.id));
  };

  const handleRemove = (e, id) => {
    dispatch(deleteItemFromCartAsync(id));
    setTimeout(() => {
      dispatch(fetchItemsByUserIdAsync(user.id));
    }, 40);
  };

  const handleAddress = (e) => {
    // console.log(e.target.value);
    setSelectedAddress(user.addresses[e.target.value]);
  };

  const handlePayment = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleOrder = (e) => {
    const order = {
      items,
      totalAmount,
      totalItems,
      user: user.id,
      paymentMethod,
      selectedAddress,
      status: "pending",
    };

    if (order.selectedAddress == null) {
      alert.error("Please Select Address");
    } else {
      dispatch(createOrderAsync(order));
    }
    // TODO : Redirect to order-success page
    // TODO : Clear cart after oder
    // TODO : on Server change the stock number of items
    // navigate("/order-success");
  };

  const handleCheckout = async () => {
    const stripe = await loadStripe(
      "pk_test_51OrFmISCebnZsCxyFc5B0diQyTjuuNrMDfReUhG7MX3B6y7ksmgRfIatYqMUT54MNk7853gA5yQI8sKwcN4BT02Z00KJUMhuMf"
    );
    const orderItems = await currentOrder.items;
    // console.log("orderItems is-->", orderItems);
    const body = {
      products: orderItems,
      id: currentOrder.id,
    };
    // console.log("body is -->", body);
    // console.log("currentOrder.items is -->", currentOrder.items);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const session = await response.json();
    const result = stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      // console.log(result.error);
    }
  };

  if (currentOrder && currentOrder.paymentMethod === "card") {
    handleCheckout();
  }

  return (
    <>
      {!items.length && <Navigate to="/" replace={true}></Navigate>}
      {/* {console.log("currentOrder initiallly is -->", currentOrder)} */}
      {currentOrder && currentOrder.paymentMethod === "cash" && (
        <Navigate
          to={`/order-success/${currentOrder.id}`}
          replace={true}
        ></Navigate>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <form
              noValidate
              onSubmit={handleSubmit((data) => {
                // console.log(data);
                dispatch(
                  updateUserAsync({
                    ...user,
                    addresses: [...user.addresses, data],
                  })
                );
                reset();
              })}
              className="bg-white px-10 py-10"
            >
              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-2xl font-semibold leading-7 text-gray-900">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Use a permanent address where you can receive mail.
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Full Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register("name", {
                            required: "Name is Required",
                          })}
                          id="name"
                          autoComplete="given-name"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Email address
                      </label>
                      <div className="mt-2">
                        <input
                          id="email"
                          {...register("email", {
                            required: "Email is Required",
                          })}
                          type="email"
                          autoComplete="email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Phone Number
                      </label>
                      <div className="mt-2">
                        <input
                          id="phone"
                          {...register("phone", {
                            required: "Phone is Required",
                          })}
                          type="tel"
                          autoComplete="phone"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="street"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Street address
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register("street", {
                            required: "Street Address is Required",
                          })}
                          id="street"
                          autoComplete="street"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        City
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register("city", {
                            required: "City is Required",
                          })}
                          id="city"
                          autoComplete="address-level2"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        State / Province
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register("state", {
                            required: "State is Required",
                          })}
                          id="state"
                          autoComplete="address-level1"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="pinCode"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        ZIP / Postal code
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register("pinCode", {
                            required: "Pin Code is Required",
                          })}
                          id="pinCode"
                          autoComplete="pinCode"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-x-4">
                    <button
                      type="button"
                      className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSubmit}
                      type="submit"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Add Address
                    </button>
                  </div>
                </div>

                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Addresses
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Choose From Existing Address
                  </p>
                  <ul role="list" className="divide-y divide-gray-100">
                    {user.addresses.map((address, index) => (
                      <li
                        key={index}
                        className="flex justify-between gap-x-6 py-5 border-2 px-2 border-gray-200 rounded-md my-1"
                      >
                        <div className="flex min-w-0 gap-x-4">
                          <input
                            onChange={handleAddress}
                            value={index}
                            name="email"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6 text-gray-900">
                              {address.name}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                              {address.email}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                              {address.street} - {address.pincode}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                              {address.phone}
                            </p>
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                          <p className="text-sm leading-6 text-gray-900">
                            {address.role}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {address.city}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 space-y-10">
                    <fieldset>
                      <legend className="text-sm font-semibold leading-6 text-gray-900">
                        Payment Method
                      </legend>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Choose One
                      </p>
                      <div className="mt-6 space-y-6">
                        <div className="flex items-center gap-x-3">
                          <input
                            onChange={handlePayment}
                            value="cash"
                            checked={paymentMethod === "cash"}
                            // name="payments"
                            id="cash"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label
                            htmlFor="cash"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Cash
                          </label>
                        </div>
                        <div className="flex items-center gap-x-3">
                          <input
                            id="Card"
                            onChange={handlePayment}
                            value="card"
                            checked={paymentMethod === "card"}
                            // name="payments"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label
                            htmlFor="card"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Card
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="mx-auto max-w-7xl px-4 bg-white sm:px-6 lg:px-8">
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <h1 className="text-4xl font-bold tracking-tight my-5 text-gray-900">
                  Cart
                </h1>
                <hr className="my-5" />
                <div className="flow-root">
                  <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {items &&
                      items.map((item) => (
                        <li key={item.id} className="flex py-6">
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
                                <p className="ml-4">
                                  $
                                  {Math.round(
                                    item.product.price *
                                      (1 -
                                        item.product.discountPercentage / 100)
                                  )}
                                </p>
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
                                  Qty
                                  {/* {console.log(items)} */}
                                </label>
                                <select
                                  onChange={(e) => handleQuantity(e, item)}
                                  value={item.quantity}
                                  className="py-1 border-inherit mx-2 rounded-md "
                                >
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5</option>
                                </select>
                              </div>

                              <div className="flex">
                                <button
                                  onClick={(e) => handleRemove(e, item.id)}
                                  type="button"
                                  className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  Remove
                                </button>
                              </div>
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
                  <p>${totalAmount}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 my-3">
                  <p>Total Items in Cart</p>
                  <p>{totalItems}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                  <div
                    onClick={handleOrder}
                    className="flex items-center cursor-pointer justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    Pay or Order
                  </div>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    or{" "}
                    <Link to="/">
                      <button
                        type="button"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => setOpen(false)}
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
