function injectScript(file, body) {
  const bodyHead = document.getElementsByTagName(body)[0];
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file);
  bodyHead.appendChild(script);
}

injectScript(chrome.runtime.getURL('/backend/hook.js'), 'body');

window.addEventListener('message', (event) => {
  if (event.source !== window) 
  return;
});

window.addEventListener("React-Scope", (message) => {
  chrome.runtime.sendMessage({ data: message.detail });
}, false);

// send message to devtools on page refresh
window.addEventListener("beforeunload", function() {
  chrome.runtime.sendMessage({ refresh: "true" });
}, false);
