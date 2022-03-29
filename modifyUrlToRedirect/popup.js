let trans = document.getElementById("trans");
trans.onclick = function () {
  let one = document.getElementById("one").value;
  let another = document.getElementById("another").value;
  let which = document.getElementById("which").value;
  which = (which === "" ? 1 : parseInt(which));
  if(one !== "" && another !== "") {
    callContentScript({one, another, which, info: "popup: redirect"}, function (res) {console.log(res);})
  } else {
    console.log("The first two of input can't be empty!");
  }
}

function callContentScript(msg, callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, res => {
      callback(res);
    })
  });
}

let ls = document.getElementById("list");
loadHistory("redirectHistory", "rHLastTime");

ls.onclick = function (e) {
  e = e || window.event;
  let one, another, which;
  if(e.target.parentNode.className === "close") {
    one = e.target.parentNode.parentNode.getElementsByClassName("one")[0].innerHTML;
    another = e.target.parentNode.parentNode.getElementsByClassName("another")[0].innerHTML;
    which = e.target.parentNode.parentNode.getElementsByClassName("which")[0].innerHTML;
    console.log(one + " " + another + " " + which);
  }
  if(e.target.className === "tag") {
    one = e.target.getElementsByClassName("one")[0].innerHTML;
    another = e.target.getElementsByClassName("another")[0].innerHTML;
    which = e.target.getElementsByClassName("which")[0].innerHTML;
  }
  else if(e.target.className === "another" ||
      e.target.className === "which" ||
      e.target.className === "one" ||
      e.target.className === "close") {
    one = e.target.parentNode.getElementsByClassName("one")[0].innerHTML;
    another = e.target.parentNode.getElementsByClassName("another")[0].innerHTML;
    which = e.target.parentNode.getElementsByClassName("which")[0].innerHTML;
  }

  if(e.target.parentNode.className === "close" || e.target.className === "close") {
    chrome.storage.sync.get(["redirectHistory"], function(result) {

      if(result !== undefined && result.redirectHistory !== undefined) {
        for (let i = 0; i < result.redirectHistory.length; i++) {
          if(result.redirectHistory[i].one === one &&
              result.redirectHistory[i].another === another &&
              result.redirectHistory[i].which.toString() === which) {
            result.redirectHistory.splice(i, 1);
            break;
          }
        }
        chrome.storage.sync.set({"redirectHistory": result.redirectHistory}, function () {
          console.log("Remove Storage finished!");
          if(e.target.parentNode.className === "close") e.target.parentNode.parentNode.remove();
          else e.target.parentNode.remove();
        })
      }

    });
  } else {
    document.getElementById("one").value = one;
    document.getElementById("another").value = another;
    document.getElementById("which").value = which;
  }

}


function loadHistory(key, keyLastTime) {
  chrome.storage.sync.get([key, keyLastTime], function(result) {

    if(result !== undefined && result[key] !== undefined) {

      for(let i = 0; i < result[key].length; ++i) {
        let li = document.createElement("li");
        li.setAttribute("class", "tag");
        Object.keys(result[key][i]).forEach(function (k) {
          liAppendSpan(li, k, result[key][i][k]);
        })
        liAppendSpan(li, "close", '<img src="close.svg"/>');

        ls.appendChild(li);
      }
    }

    if(result !== undefined && result[keyLastTime] !== undefined) {
      document.getElementById("one").value = result[keyLastTime]["one"];
      document.getElementById("another").value = result[keyLastTime]["another"];
      document.getElementById("which").value = result[keyLastTime]["which"];
    }

    console.log("Caught you! " + key);
  });

  function liAppendSpan(li, name, value) {
    let span = document.createElement("span");
    span.setAttribute("class", name);
    span.innerHTML = value;
    li.appendChild(span);
  }

}
