function injectScript(file, body) {
  const bodyHead = document.getElementsByTagName(body)[0];
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file);
  bodyHead.appendChild(script);
}

window.addEventListener('message', (event) => {
  if (event.source !== window) 
  return;
});

window.addEventListener("React-Scope-Test", (message) => {
  chrome.runtime.sendMessage(message.detail)
}, false)


injectScript(chrome.runtime.getURL('/backend/hook.js'), 'body');
