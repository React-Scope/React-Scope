if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('React Developer Tools must be installed for React Scope');
}

// added code for version 16 or lower
var devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
var reactInstances = devTools._renderers;
var rid = Object.keys(reactInstances)[0];
var reactInstance = reactInstances[rid];

var fiberDOM;
var currState;
var initialState;
var reduxStore15;

var runFifteen = false;

// get initial state and only run once
function getInitialStateOnce() {
  // console.log("getInitialStateOnce is running")
  let run = false;
  return function getInitialState() {
    if (!run) {
      // grab initial state
      let initStateSet = devTools._fiberRoots[rid];
      initStateSet.forEach((item) => {
        initialState = item;
      });
      // parse state
      initialState = checkReactDOM(initialState.current.stateNode);
      run = true;
    }
  };
}

// set initial state
var setInitialStateOnce = getInitialStateOnce();
(function setInitialState() {
  if (reactInstance && reactInstance.version) {
    // get initial state for 16 or higher
    // console.log("setInitial State is running ")
    setInitialStateOnce();
    setTimeout(() => {
      // saveCache.addToHead(initialState); //move this step to devtools.js instead
      // console.log('initial state: ', initialState)
      transmitData(initialState);
    }, 100);
  } else if (reactInstance && reactInstance.Mount) {
    // get intiial state for 15
    // console.log('getting intial state for 15')
    getFiberDOM15();
  } else {
    // console.log("React Dev Tools is not found")
  }
}());

// async version -- should we check for older browsers?!?!?! or use promises?!
async function getFiberDOM16(instance) {
  // console.log("getFiberDOM16 is running")
  try {
    fiberDOM = await instance;
    currState = await checkReactDOM(fiberDOM);
    // console.log(currState)
    // saveCache.addToHead(currState); move this step to devtools.js instead 
    transmitData(currState);
  } catch (e) {
    console.log(e);
  }
}


