# Product Management App

Plain JavaScript (ES6+), HTML and CSS se bana hua Product Management App. Koi library ya framework use nahi hua.

## Features

- Products create, edit, delete aur display
- Search (debounced), category filter, sorting (price / name)
- REST API se data fetch (`fetch` + `async/await`) - [DummyJSON API](https://dummyjson.com/products)
- Shopping cart: quantity +/-, price aur total calculation
- Cart `localStorage` me save hota hai (refresh ke baad bhi rahega)
- Error handling (API fail / timeout par message + sample products fallback) aur form validation

## Project Structure

```
product-manager/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js         # main file: state, filters, events
    ├── api.js         # REST API calls (GET / POST / PUT / DELETE)
    ├── cart.js        # cart logic (closure + Map + localStorage)
    ├── ui.js          # rendering: product cards, cart, toast
    ├── utils.js       # debounce, throttle, withTimeout, formatPrice
    ├── validators.js  # form validation
    └── data.js        # local sample products (images/)
```

## Setup and Run

ES modules (`type="module"`) direct file double-click karke nahi chalte, isliye ek local server chalao:

**Option 1 - VS Code:** "Live Server" extension install karo -> `index.html` pe right click -> *Open with Live Server*

**Option 2 - Python:**
```bash
cd product-manager
python -m http.server 5500
```
Phir browser me kholo: http://localhost:5500

**Option 3 - Node:**
```bash
npx serve product-manager
```

Internet chahiye kyunki products API se aate hain.

## Note about the API

DummyJSON `POST / PUT / DELETE` requests accept karta hai par data actually save nahi karta. Local sample products (`local: true`) server pe exist nahi karte, isliye unke edit/delete me server call skip hoti hai. App me create / edit / delete ke baad local state bhi update hota hai, taaki UI me changes dikhein. Page refresh karne par products API se dobara load honge (cart localStorage se wapas aayega).

## JavaScript Concepts Used

| Concept | Kahan use hua | Kyun |
|---|---|---|
| **Closure** | `debounce`, `throttle` (utils.js), `createCart` (cart.js) | `timer`, `waiting` aur cart ka `items` private rehte hain, bahar se sirf functions ke through access hota hai |
| **Promises** | `withTimeout` (utils.js) | `Promise.race` se API ko timeout dene ke liye; `async/await` bhi Promises par hi based hai |
| **async/await** | `api.js`, `init()`, form submit aur delete handler (`app.js`) | API calls ko clean tarike se likhne ke liye, `try/catch` ke saath |
| **Map** | `cart.js` | Cart items ko product id se store karna (fast lookup, duplicate nahi) |
| **Set** | `fillCategories` (app.js) | Products me se unique categories nikalna |
| **Debouncing** | Search input | Har key press pe nahi, typing rukne ke 300ms baad search chalta hai |
| **Throttling** | Scroll event (header par shadow toggle, `app.js`) | Scroll bahut baar fire hota hai, 150ms me sirf ek baar chalta hai |
| **Event Delegation** | Product grid aur cart list | Ek hi listener parent par, `e.target.closest()` se pata chalta hai konsa button dabaya |
| **ES6+ features** | Poore project me | `const/let`, arrow functions, template literals, destructuring, spread, rest/default parameters, modules, `Object.fromEntries` |

## Error Handling and Validation

- API fail / timeout (8 second) hone par error message dikhta hai aur local sample products se app chalti rehti hai
- Form validation: name (min 3 chars), price > 0, category required, image optional hai (http(s) URL ya local path jaise `images/photo.jpg`)
- Create / edit / delete fail hone par error toast aata hai aur modal khula rehta hai
- Kharab localStorage data par app crash nahi hota (khali cart se start)
- User input `textContent` se render hota hai (`innerHTML` se nahi), isliye XSS se bachav hota hai