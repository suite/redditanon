let selectValue = "";

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    let { url, method } = details;
    console.log(url, method);
    if (details.requestBody) {
      let contentObj;

      //Check content type
      if (details.requestBody["formData"]) {
        let contentText = details.requestBody["formData"]["text"][0];
        let contentId = details.requestBody["formData"]["thing_id"][0];
        contentObj = { contentText, contentId };
      } else {
        let postedString = decodeURIComponent(
          String.fromCharCode.apply(
            null,
            new Uint8Array(details.requestBody.raw[0].bytes)
          )
        );

        console.log(postedString);

        let contentId = postedString.split("thing_id=")[1].split("&")[0];
        let content = postedString.split("richtext_json=")[1].trim();
        if (content != "") {
          let contentParsed = JSON.parse(content);
          let contentText = contentParsed["document"][0]["c"][0]["t"];
          contentObj = { contentText, contentId };
        }
      }

      console.log(selectValue, contentObj);

      if (selectValue === "random") {
        //Send comment to custom server
        sendComment(contentObj, selectValue)
          .then(resp => {
            console.log("got it", contentObj, selectValue, resp);
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: `Sent comment using [${selectValue}]`,
                url: resp["url"]
              });
            });
          })
          .catch(err => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: err.message
              });
            });
          });

        return { cancel: true };
      }

      // for debug:
      return { cancel: true };
    }
  },
  { urls: ["https://oauth.reddit.com/*"] },
  ["requestBody", "blocking"]
);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.value) {
    selectValue = request.value;
  }
});

const getApiUrl = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("api", function(item) {
      resolve(item["api"] ? item["api"] : "http://localhost:3000/");
    });
  });
};

const sendComment = async (contentObj, selectValue) => {
  let url = await getApiUrl();
  console.log("Settings retrieved", url);

  let { contentText, contentId } = contentObj;
  const rawResponse = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contentText, contentId, selectValue })
  });

  const content = await rawResponse.json();

  if (rawResponse.ok) {
    return content;
  } else {
    console.log("Error response look here", content, rawResponse.ok);
    throw new Error("Error submitting comment/reply.");
  }
};
