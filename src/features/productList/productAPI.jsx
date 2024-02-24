export function fetchAllProducts() {
  return new Promise(async (resolve) => {
    const response = await fetch("http://localhost:8080/products");
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchProductsByFilters({ filter, sort, pagination }) {
  // filter = {"category":"smartphone"}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let queryString = "";
  for (let key in filter) {
    const categoryValues = filter[key];
    if (categoryValues.length) {
      const lastValue = categoryValues[categoryValues.length - 1];
      queryString += `${key}=${lastValue}&`;
    }
  }

  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`;
  }

  console.log(pagination);
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`;
  }

  return new Promise(async (resolve) => {
    const response = await fetch(
      "http://localhost:8080/products?" + queryString
    );
    const data = await response.json();
    // resolve({ data });
    // const totalItems = await response.headers.get("X-Total-Count");
    const products = data.data;
    const totalItems = data.items;

    resolve({ data: { products: products, totalItems: totalItems } });
  });
}
