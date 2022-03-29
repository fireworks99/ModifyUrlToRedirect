chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.info === "popup: redirect") {
    solve(request.one, request.another, request.which);
  }
  sendResponse("(content script)I finished my task! Ah ha ha ha!");
})

function solve(one, another, which) {
  let url = window.location.href;
  let ans = find(url, one);
  if(ans.length !== 0) {
    //one --> another
    transform(one, another, which, ans, url);
  } else {
    ans = find(url, another);
    if(ans.length !== 0) {
      //another --> one
      transform(another, one, which, ans, url);
    } else {
      alert("Can't find your input in url!");
    }
  }
}

function find(t, s) {
  let ans = [], pos = 0;
  while(true) {
    pos = t.indexOf(s, pos);
    if(pos === -1) {
      break;
    } else {
      ans.push(pos);
      pos++;
    }
  }
  return ans;
}

function transform(from, to, which, arr, url) {
  if(arr.length > 1) {
    //set ans[0] as targeted index
    if(which <= arr.length) {
      redirect(url, arr[which - 1], from, to, which);
    } else {
      alert("The third input is wrong.");
    }
  }
  else {
    if(which > 1) {
      alert("The third input is wrong.");
    } else redirect(url, arr[0], from, to, 1);
  }
}

function redirect(url, index, from, to, which) {
  let aim = url.substr(0, index);
  aim += to;
  aim += url.substr(index + from.length);

  let obj = {one: from, another: to, which};
  addHistory("redirectHistory", "rHLastTime", obj, function (info) {
    window.location = aim;
    console.log(info);
  }, "Storage.");
}

function addHistory(key, keyLastTime, value, callback, args) {
  chrome.storage.sync.get([key, keyLastTime], function(result) {
    if(JSON.stringify(result) === "{}") {
      chrome.storage.sync.set({[key]: [value], [keyLastTime]: value}, callback(args));
    } else {
      let unique = true;
      for(let i = 0; i < result[key].length; ++i) {
        let t = result[key][i], cnt = 0, tot = 0;
        Object.keys(result[key][i]).forEach(function (k) {
          cnt++;
          if(t[k] === value[k]) tot++;
        })
        if(cnt === tot) {
          unique = false;
          break;
        }
      }
      if(unique === true) result[key].push(value);
      chrome.storage.sync.set({[key]: result[key], [keyLastTime]: value}, callback(args));
    }
  });
}
