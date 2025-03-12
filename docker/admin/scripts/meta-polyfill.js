// Немедленно определяем crypto.randomUUID
if (typeof window.crypto === "undefined") window.crypto = {};
if (typeof window.crypto.randomUUID !== "function") {
  window.crypto.randomUUID = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  console.log("Meta polyfill активирован");
} 