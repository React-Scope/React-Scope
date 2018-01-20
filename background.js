const connections = {};
//this is where it's causing the weird synax error that says instances has been declared already
chrome.runtime.onConnect.addListener(function(devtoolsConnections) {
  console.log('connected to addlistener devltoolsconnections')
  var devToolsRequest = (message, sender, sendResponse) => {
    chrome.tabs.executeScript(message.tabId, { file: 'content_script.js'});
  }
  devtoolsConnections.onMessage.addListener(devToolsRequest);
  devtoolsConnections.onDisconnect.addListener(() => {
    devtoolsConnections.onMessage.removeListener(devToolsRequest);
  });
});

chrome.runtime.onConnect.addListener(function (port) {
  let extensionListener = (message, sender, response) => {
    if (message.name == 'connect' && message.tabId) {
      chrome.tabs.sendMessage(message.tabId, message);
      connections[message.tabId] = port;
      return;
    }
  }

  //listening to messages sent from devtools.js
  port.onMessage.addListener(extensionListener);

  // to clean up data with disconnect
  port.onDisconnect.addListener(function(port) {
    port.onMessage.removeListener(extensionListener)

    let tabs = Object.keys(connections)
    for (let i = 0; i < tabs.length; i++) {
      if (connections[tabs[i] == port]) {
        delete connections[tabs[i]]
        break;
      }
    }
  })
});

chrome.runtime.onMessage.addListener(function (req, sender, res) {
  if (sender.tab) {
    let tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(req)
    } else {
      console.log('Tab not found!');
    }
  } else {
    console.log('Sender.tab is not defined');
  }
  return true;
});
