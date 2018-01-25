import * as D3Chart from './createTree.js';
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
  let curr;
  let prev;
  const addListeners = () => {
    document.querySelector('#zIn').addEventListener('click', D3Chart.zoomIn);
    document.querySelector('#zOut').addEventListener('click', D3Chart.zoomOut);
  
    // call a zoom in / zoom out to fix first pan/drag event,
    // without this, first dragging chart will cause it to jump on screen
    D3Chart.zoomIn();
    D3Chart.zoomOut();
  };

  function sendMessage() {
    let port = chrome.runtime.connect({
      name: chrome.runtime.id,
    });
    addListeners();
    port.postMessage({
      name: 'connect',
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
    port.onMessage.addListener((msg) => {
      console.log('cache', cache);
      cache.addToHead(msg);
      currentState = cache.head;
      treeInput = currentState.value.data.currentState[0];
      console.log('TREE DATA', treeInput);
      D3Chart.createTree(treeInput);
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
    $('#optimize').click(function() {
      console.log('Optimize')
      $('#opt').empty();
      curr = getChildren(cache.head.value.data.currentState[0])
      prev = getChildren(cache.head.prev.value.data.currentState[0])
      console.log('curr', curr)
      console.log('prev', prev)
      console.log('click cache', cache)
      let result = checkOptComponents(curr,prev, cache) // stored optimize data 
      console.log('results!!!!!!', result)
      $('#opt').append("<p>stateful Comp being re-rendered w/o state changes:"+ JSON.stringify(result[0], null, 2)+ "</p>");
      $('#opt').append("<p>stateful Comp that are re-rendered w/ state changes:"+ JSON.stringify(result[1], null, 2)+ "</p>");
      $('#opt').append("<p>All components re-render w/o state changes:"+ JSON.stringify(result[2], null, 2)+ "</p>");  
      Object.keys(result[0]).forEach(val=> {
        console.log('checking val!!!!~~~~',val)
        $('#'+val+'').css('fill', 'pink')
      })
      // D3Chart.createTree(currentState.value.data.currentState[0], result);
      
    })

    $('#oldestBtn').click(function() {
      console.log('Tail')
      $('#nodeData').empty();
      $('#opt').empty();
      currentState = cache.tail;
      D3Chart.createTree(currentState.value.data.currentState[0]);
    })

    $('#newestBtn').click(function() {
      console.log('Head')    
      $('#nodeData').empty();
      $('#opt').empty();
      currentState = cache.head;
      D3Chart.createTree(currentState.value.data.currentState[0]);     
    })

    $('#prevBtn').click(function() {
      console.log('Prev')
      $('#nodeData').empty();
      $('#opt').empty();
      currentState = currentState.prev;
      D3Chart.createTree(currentState.value.data.currentState[0]);   
    })

    $('#nextBtn').click(function() {
      console.log('Next')
      $('#nodeData').empty();
      $('#opt').empty();
      currentState = currentState.next;
      D3Chart.createTree(currentState.value.data.currentState[0]);   
    })
  });
  
  
  //to check which stateful components are being re-rendered without having any state changes
  //the currentArray and prevArray are the return values of getChildren(cache.head.value.data.currentState[0]) and getChildren(cache.head.prev.value.data.currentState[0])
  function checkOptComponents(currentArray, prevArray, cache) {
    let badRendered = {};
    let goodRendered = {};
    //check for state(s)
    for (let i = 0 ; i < currentArray.length; i++) {
      if (currentArray[i].state !== null) {
        if (JSON.stringify(currentArray[i].state) === JSON.stringify(prevArray[i].state)) {
          if (currentArray[i].name !== undefined) {
            // badRendered.push(currentArray[i].name)
            badRendered[currentArray[i].id] = currentArray[i].name
          }
        }
        else if (currentArray[i].name !== undefined) {
          goodRendered[currentArray[i].id] = currentArray[i].name
        }
      }
      //check the store(s)
      if (currentArray[i].store !== null) {
        if (JSON.stringify(currentArray[i].store) === JSON.stringify(prevArray[i].store)) {
          if (currentArray[i].name !== undefined) {
            badRendered[currentArray[i].id] = currentArray[i].name
          }
        }
        else if (currentArray[i].name !== undefined) {
          goodRendered[currentArray[i].id] = currentArray[i].name
        }
      }
    }
    console.log("Stateful components being re-rendered WITHOUT state changes: ", badRendered)
    console.log('Stateful components that are rendered WITH state changes: ', goodRendered)

    //count how many times the components is being re-rendered without having any state changes at all
    let count = 0; 
    let current = cache.head; 
    console.log("before previous")
    let previous = cache.head.prev
    console.log("is it going in?")
    console.log("inside opt function", previous)
    while (current!== null && previous !== null && JSON.stringify(current.value.data) === JSON.stringify(previous.value.data)) {
      count++
      current = current.prev;
      previous = previous.prev
    }
    console.log('All components are being re-rendered without any state changes at all for: ', count, " time(s).")
    return [badRendered,goodRendered,count];
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

    // if (node.name !== 'div') {
      result.push({
        name: node.name,
        props: node.props,
        state: node.state,
        id: node.id,
        store: node.store,
      });
    // }

    Object.keys(node.children).forEach((key) => {
      result = result.concat(getChildren(node.children[key]));
    });
    return result;
  }

  //May need for d3:
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