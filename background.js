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
        sendComment(contentObj, selectValue).then(() => {
          console.log("got it", contentObj, selectValue);
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: `Sent comment using [${selectValue}]`
            });
          });

          return { cancel: true };
        });
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
    console.log(request.value);
    selectValue = request.value;
  }
});

const sendComment = async (contentObj, selectValue) => {
  const rawResponse = await fetch("http://localhost:3000/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contentObj, selectValue })
  });

  const content = await rawResponse.json();

  console.log(content);
};

//api_type=json&return_rtjson=true&thing_id=t1_flt7kxo&text&richtext_json={"document":[{"e":"par","c":[{"e":"text","t":"1234"}]}]}
//api_type=json&return_rtjson=true&thing_id=t1_flt7qyn&text&richtext_json={"document":[{"e":"par","c":[{"e":"text","t":"1235"}]}]}
//data["document"][0]["c"][0]["t"];

//api_type=json&return_rtjson=true&thing_id=t3_fr02ax&text&richtext_json={"document":[{"e":"par","c":[{"e":"text","t":"sad"}]}]}

/*
Mobile:
api_type: ["json"]
raw_json: ["1"]
text: ["sad"]
thing_id: ["t3_fr02ax"] 
*/
