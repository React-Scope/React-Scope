import createTree from './createTree.js';
import $ from 'jquery';

function createPanel() {
  chrome.devtools.panels.create(
    'React-Scope', // title of the panel
    null, // the path to the icon
    'devtools.html', // html page for injecting into the tab's content
    (sendMessage), // callback function optional
  );

  // let storage = {};
  const cache = new StateCache();
  let currentState;
  let treeInput;
  let cleanData = []; // clean data
  let reactData = {}; // current state data
   // let prevData = []; // previous state data
  // let prevNode; // track of previous state



  function sendMessage() {
    let port = chrome.runtime.connect({
      name: chrome.runtime.id,
    });
    port.postMessage({
      name: 'connect',
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
    port.onMessage.addListener((msg) => {
      console.log(msg)
      if (msg.data) {
        console.log('cache', cache);
        cache.addToHead(msg.data);
        reactData = cache.head.value.data.currentState[0];
        prevNode = cache.head.prev;
        cleanData = getChildren(reactData);
        console.log(cleanData, 'result');
        return;
      }
    });
  }

  // clear cache on refresh of application
  chrome.runtime.onMessage.addListener(function (req, sender, res) {
    if (req.refresh === 'true') {
      cache.head = cache.tail = null;
      cache.length = 0;
    }
  });

      console.log('cache', cache);
      cache.addToHead(msg);
      currentState = cache.head;
      treeInput = currentState.value.data.currentState[0];
      console.log('TREE DATA', treeInput);
      createTree(treeInput);

      // reactData = cache.head.value.data.currentState[0];
      // prevNode = cache.head.prev;
      // cleanData = getChildren(reactData);
      console.log(cleanData, 'result');
      return;
    });
  }

  //on click functionality:
    //current state variable that starts a this.head;
    //currentState.value holds the data;
    //click events:
      ////next: currentState = currentState.next;
      ////prev: currentState = currentState.prev;
      ////oldest: currentState = cache.tail;
      ////newest: currentState = cache.head;
 
  $(document).ready(function() {
    $('#oldestBtn').click(function() {
      console.log('OUCH!')
      $('#nodeData').empty();
      currentState = cache.tail;
      createTree(treeInput);
    })

    $('#newestBtn').click(function() {
      console.log('OUCH!')    
      $('#nodeData').empty();
      currentState = cache.head;
      createTree(treeInput);      
    })

    $('#prevBtn').click(function() {
      console.log('OUCH!')
      $('#nodeData').empty();
      currentState = currentState.prev;
      createTree(treeInput);      
    })

    $('#nextBtn').click(function() {
      console.log('OUCH!')
      $('#nodeData').empty();
      currentState = currentState.next;
      createTree(treeInput);      
    })
  });
  
  
  //to check which stateful components are being re-rendered without having any state changes
  //the currentArray and prevArray are the return values of getChildren(cache.head.value.data.currentState[0]) and getChildren(cache.head.prev.value.data.currentState[0])
  function checkOptComponents(currentArray, prevArray, cache) {
    let badRendered = [];
    let goodRendered = [];
    //check for state(s)
    for (let i = 0 ; i < currentArray.length; i++) {
      if (currentArray[i].state !== null) {
        if (JSON.stringify(currentArray[i].state) === JSON.stringify(prevArray[i].state)) {
          if (currentArray[i].name !== undefined) {
            badRendered.push(currentArray[i].name)
          }
        }
        else if (currentArray[i].name !== undefined) {
            goodRendered.push(currentArray[i].name)
        }
      }
      //check the store(s)
      if (currentArray[i].store !== null) {
        if (JSON.stringify(currentArray[i].store) === JSON.stringify(prevArray[i].store)) {
          if (currentArray[i].name !== undefined) {
            badRendered.push(currentArray[i].name)
          }
        }
        else if (currentArray[i].name !== undefined) {
          goodRendered.push(currentArray[i].name)
        }
      }
    }
    console.log("Stateful components being re-rendered WITHOUT state changes: ", badRendered)
    console.log('Stateful components that are rendered WITH state changes: ', goodRendered)

    //count how many times the components is being re-rendered without having any state changes at all
    let count = 0; 
    let current = cache.head; 
    let previous = cache.head.prev
    while (current!== null && previous !== null && JSON.stringify(current.value.data) === JSON.stringify(previous.value.data)) {
      count++
      current = current.prev;
      previous = previous.prev
    }
    console.log('All components are being re-rendered without any state changes at all for: ', count, " time(s).")
    return;
  }

  function retrieveState(string) {
    switch (string) {
      case 'current':
        console.log(cleanData, 'current');
        prevNode = cache.head.prev;
        break;
      case 'previous':
        if (prevNode.prev) {
          prevNode = prevNode.prev;
          prevData = getChildren(prevNode.value.data.currentState[1].children[3]);
          console.log(prevData, 'previous Data');
        } else console.log('no more previous state');
        break;
      case 'next':
        if (prevNode.next) {
          prevNode = prevNode.next;
          prevData = getChildren(prevNode.value.data.currentState[1].children[3]);
          console.log(prevNode, 'next data');
        } else console.log('no more next state');
        break;
      // case "next":
      //     prevData = getChildren();
      //     console.log(prevData, "initial Data")
      //     break;
      default:
        prevNode = cache.head.prev;
        console.log(cleanData, 'cleanData');
    }
  }

  function getChildren(child) {
    let result = [];
    const node = child;

    if (node.name !== 'div') {
      result.push({
        name: node.name,
        props: node.props,
        state: node.state,
      });
    }

    Object.keys(node.children).forEach((key) => {
      result = result.concat(getChildren(node.children[key]));
    });
    return result;
  }

  // May need for d3:
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
  // Here we are using a doubly linked list to store state changes
  function StateCache() {
    this.head = null;
    this.tail = null;
    this.length = 0; 
  }

  function Node(val) {
    this.value = val;
    this.next = null;
    this.prev = null;
  }

  StateCache.prototype.addToHead = function (value) {
    const data = stringifyData(value);
    const node = new Node(data);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.head;
      this.head.next = node;
      this.head = node;
    }
    this.length++;
  };
}



createPanel();