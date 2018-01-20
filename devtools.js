function createPanel() {
  chrome.devtools.panels.create(
    'React-Scope', // title of the panel
    null, // the path to the icon
    'devtools.html', // html page for injecting into the tab's content
    (sendMessage), // callback function optional
  );

  // let storage = {};
  const cache = new StateCache();
  let cleanData = []; // clean data
  let prevData = []; // previous state data
  let prevNode; // track of previous state
  let reactData = {}; // current state data

  function sendMessage() {
    let port = chrome.runtime.connect({
      // name: 'ilhfmcnjanhibheilakfaahiehikcmgf',
      // name: 'gipfpnbcdiknjomlnphmckabkmoeebon'
      name: chrome.runtime.id,
    });
    port.postMessage({
      name: 'connect',
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
    port.onMessage.addListener((msg) => {
      console.log('cache', cache);
      cache.addToHead(msg);
      reactData = cache.head.value.data.currentState[0];
      prevNode = cache.head.prev;
      cleanData = getChildren(reactData);
      console.log(cleanData, 'result');
      return;
    });
  }
  
  // function messageReact(data) { // sending the message to the React App
  //   setTimeout(() => {
  //     window.postMessage({
  //       message: 'hello there from devtool.js!',
  //       data,
  //     }, '*');
  //   }, 10);
  //   return data;
  // }

  // convert data to JSON for storage
  function stringifyData(obj) {
    let box = [];
    const data = JSON.parse(JSON.stringify(obj, ((key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (box.indexOf(value) !== -1) {
          return;
        }
        box.push(value);
      }
      return value;
    })));
    box = null;
    return data;
  }
}

createPanel();