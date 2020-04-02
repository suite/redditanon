window.addEventListener("load", function() {
  console.log("Loaded RedditAnon");

  let username = document.getElementsByClassName("_2BMnTatQ5gjKGK5OWROgaG")[0]
    .innerText;

  let profilePic = document.getElementsByClassName("-z42jjKOFdAdFhdJ8mmI4")[0]
    .src;

  let randProfilePic = `https://i.imgur.com/0yTCzuu.jpg`;

  //Load html once page loads
  insertHtml(username, profilePic);

  var ss = document.createElement("script");
  ss.innerHTML = `
  function selectChange(self) {
    let selectVal = self.value;
    let profileElem = self.parentNode.getElementsByTagName('img')[0];
    (selectVal === "random") ? profileElem.src = "${randProfilePic}" : profileElem.src = "${profilePic}";
  }
  `;
  document.documentElement.appendChild(ss);

  //Send selectValue when you reply
  document.body.addEventListener("click", function(event) {
    if (
      event.target.innerText === "COMMENT" ||
      event.target.innerText === "REPLY"
    ) {
      let elem = event.target.parentNode;
      for (let i = 0; i < 2; i++) {
        elem = elem.parentNode;
      }

      if (typeof chrome.app.isInstalled !== "undefined") {
        chrome.runtime.sendMessage({
          value: elem.querySelector("select").value
        });
      } else {
        alert("Appeared to have lost connection... Please refresh");
        location.reload();
      }
    }
  });

  // Check every 500ms to add html.
  setInterval(function() {
    insertHtml(username, profilePic);
  }, 500);

  if (typeof chrome.app.isInstalled !== "undefined") {
    chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
      alert(msg.action);
      if (msg.url) {
        location.href = msg.url;
      } else {
        location.reload();
      }
    });
  }
});

let setList = [];

const insertHtml = (username, profilePic) => {
  var list = document.getElementsByClassName("_3wl1bRnSzxHkKJfvqakrNI");

  for (let item of list) {
    if (!setList.includes(item)) {
      item.insertAdjacentHTML(
        `beforeend`,
        `<div class="_17TqawK-44tH0psnHPIhzS RQTXfVRnnTF5ont3w58rx " style="position:static !important;">
      <span
        ><div
          aria-label="Italics"
          aria-selected="false"
          class="alPx0QCb4Fws5307SrGWu _1H0LLEwUP5ys6cgxr9KhMa"
          role="button"
          tabindex="-1"
        >
          <div class="Nb7NCPTlQuxN_WDPUg5Q2">
            <div
              class="ki2VbfBhU-qxg1S6VyET6 dMXy0l6Saub8-fPDkQvGC _8fNGSBGvr1Ds8PbrsUGzN"
            >Select Account</div>
          </div>
          <!-- imnage stuff -->
          <img
            id="accounticon"
            alt="Account icon"
            class="img-small"
            src="${profilePic}"
          />
          <select id="cars" style="z-index:999;margin-left:5px;" onchange="selectChange(this)">
            <option value="${username}">${username}</option>
            <option value="random">Random</option>
          </select>
        </div></span
      >
    </div>
    
    `
      );
      setList.push(item);
    }
  }
};
