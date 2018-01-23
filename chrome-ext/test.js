test('There are changes from the prevoius components to the current components.', () => {
  expect(reactOpt(currentMock, prevMock)).toBeFalsy();
});

test('The output data of the stringifyData function should be an object', () => {
  expect(stringifyData(obj)).toBe("object")
});

test('The head value of cache is going to be an object', () => {
  expect((objectValue)).toBe("object")
});

test('The new head value of cache is going to be a string', () => {
  expect((stringValue)).toBe("string")
});

test('The tail value of cache should not change, and so it is still an object', () => {
  expect((tailValue)).toBe("object")
});

test('The length of cache should be 2', () => {
  expect((cacheLength)).toBe(2)
});

//-------------------------------------Mock Data and Mock Function------------------------------------
//the function below is mock function and data is test whether it is able to detect any components' state changes
function reactOpt(currentArray, prevArray, cache) {
  let badRendered = [];
  let goodRendered = [];
  let result = {};
  for (let i = 0 ; i < currentArray.length; i++) {
    if (currentArray[i].state !== null) {
      if (JSON.stringify(currentArray[i].state) === JSON.stringify(prevArray[i].state)) {
        if (currentArray[i].name.length > 0) {
          badRendered.push(currentArray[i].name)
        }
      }
      else {
        if (currentArray[i].name.length > 0) {
          goodRendered.push(currentArray[i].name)
        }
      }
    }
    if (currentArray[i].store !== null) {
      if (JSON.stringify(currentArray[i].store) === JSON.stringify(prevArray[i].store)) {
        if (currentArray[i].name.length > 0) {
          badRendered.push(currentArray[i].name)
        }
      }
      else {
        if (currentArray[i].name.length > 0) {
          goodRendered.push(currentArray[i].name)
        }
      }
    }
  }
  result[goodRendered] = (JSON.stringify(goodRendered));
  result[badRendered] = (JSON.stringify(badRendered));
  if (result.goodRendered !== result.badRendered) {
    return true
  }
  else {
    return false;
  }
}

let currentMock = [{name: "App", state: {turn: true}}, {name: "Row", state: {turn: false}}]
let prevMock = [{name: "App", state: {turn: true}}, {name: "Row", state: {turn: false}}]


//The mock function below is to test whether stringifyData can accurately convert an input to a new input that is of the same type. 
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
  return typeof data;
}

let obj = {"a":"a", "b":"b"}
// test('The output data of the stringifyData function should be an object', () => {
//   expect(stringifyData(obj)).toBe("object")
// });


//The mock function below is to test the functionality of Doubly-LinkedList
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
    this.head.next = node;
    node.prev = this.head;
    this.head = node;
  }
  this.length++;
};

var cache = new StateCache();
let sampleComponent = {"data": {"currentState": {"name": "App", "state": "test"}}}
cache.addToHead({"data": {"currentState": {"name": "App", "state": "test"}}});
var objectValue = cache.head.value;

// test('The head value of cache is going to be an object', () => {
//   expect((objectValue)).toBe("object")
// });

cache.addToHead("Test")
var stringValue = cache.head.value; 
// test('The new head value of cache is going to be a string', () => {
//   expect((stringValue)).toBe("string")
// });

var tailValue = cache.tail.value; 
// test('The tail value of cache should not change, and so it is still an object', () => {
//   expect((tailValue)).toBe("object")
// });

var cacheLength = cache.length; 
// test('The length of cache should be 2', () => {
//   expect((cacheLength)).toBe(2)
// });
