# Product Management App

A product management application built with plain JavaScript (ES6+), HTML and CSS. No frameworks or external libraries are used.

## Features

- Create, edit, delete and display products
- Search (debounced), category filter and sorting (price / name)
- Product data fetched from a REST API using `fetch` and `async/await` ([DummyJSON](https://dummyjson.com/products))
- Shopping cart with quantity controls and price / total calculation
- Cart is saved in `localStorage` and survives a page refresh
- Error handling (API failure, timeout) and form validation

## Project Structure

```
product-manager/
├── index.html
├── css/
│   └── style.css
├── images/            # local sample product images
└── js/
    ├── app.js         # main file: state, filters, events
    ├── api.js         # REST API calls (GET / POST / PUT / DELETE)
    ├── cart.js        # cart logic (closure + Map + localStorage)
    ├── ui.js          # rendering: product cards, cart, toast
    ├── utils.js       # debounce, throttle, withTimeout, formatPrice
    ├── validators.js  # form validation
    └── data.js        # local sample products
```

## Setup and Run

The project uses ES modules (`type="module"`), which browsers do not load when `index.html` is opened directly from the file system. Serve the folder with a local web server instead.

**Option 1: VS Code Live Server**
1. Install the "Live Server" extension.
2. Right-click `index.html` and choose **Open with Live Server**.

**Option 2: Python**
```bash
cd product-manager
python -m http.server 5500
```
Then open http://localhost:5500

**Option 3: Node**
```bash
npx serve product-manager
```

An internet connection is required because products are loaded from the API.

## Note About the API

DummyJSON accepts `POST`, `PUT` and `DELETE` requests but does not actually save the data. After a successful create, edit or delete call, the app also updates its local state so the change is visible in the UI. When the page is refreshed, products are loaded from the API again (the cart is restored from `localStorage`).

The five local sample products (`js/data.js`, marked `local: true`) do not exist on the server, so the server call is skipped when they are edited or deleted. They also keep the app usable if the API is unreachable.

## JavaScript Concepts Used

| Concept | Where | Why |
|---|---|---|
| **Closure** | `debounce`, `throttle` (`utils.js`), `createCart` (`cart.js`) | `timerId`, `waiting` and the cart's `items` stay private. They can only be reached through the returned functions. |
| **Promises** | `withTimeout` (`utils.js`) | `Promise.race` between the API request and a timeout promise rejects the request if it takes longer than 8 seconds. |
| **async/await** | `api.js`, `init()`, form submit and delete handlers (`app.js`) | Keeps API calls readable, with errors handled by `try/catch`. |
| **Map** | `cart.js` | Stores cart items by product id for fast lookup and no duplicates. |
| **Set** | `fillCategories` (`app.js`) | Extracts unique categories from the product list. |
| **Debouncing** | Search input | The search runs 300 ms after the user stops typing, not on every key press. |
| **Throttling** | Scroll event (`app.js`) | The header shadow toggle runs at most once every 150 ms while scrolling. |
| **Event Delegation** | Product grid and cart list | One listener on the parent; `e.target.closest()` finds which button was clicked, including for cards added later. |
| **ES6+ features** | Throughout | `const` / `let`, arrow functions, template literals, destructuring, spread, rest and default parameters, modules, `Object.fromEntries`. |

## Error Handling and Validation

- If the API fails or takes longer than 8 seconds, an error message is shown and the app keeps working with the local sample products.
- If a create or edit request fails, an error toast is shown and the form stays open so the user can retry. A failed delete also shows an error toast and the product is kept.
- Form validation: name (at least 3 characters), price greater than 0, category required, image optional (an `http(s)` URL or a local path such as `images/photo.jpg`).
- Cart quantity cannot go below zero (the item is removed instead).
- Corrupted `localStorage` data does not crash the app; it starts with an empty cart.
- User input is rendered with `textContent` (not `innerHTML`), which protects against XSS.