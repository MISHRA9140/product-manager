// Debounce: run fn only after the user stops calling it for `delay` ms.
// Closure: timerId is remembered between calls.
export function debounce(fn, delay = 300) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Throttle: run fn at most once every `limit` ms, even if called many times.
export function throttle(fn, limit = 200) {
  let waiting = false;

  return function (...args) {
    if (waiting) return;
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => (waiting = false), limit);
  };
}

// Promise.race: whichever finishes first wins (the request or the timeout).
export function withTimeout(promise, ms = 8000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

export function formatPrice(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}