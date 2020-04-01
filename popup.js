function processForm(e) {
  if (e.preventDefault) e.preventDefault();

  chrome.storage.sync.set(
    { api: document.getElementById("apiurl").value },
    function() {
      console.log("Settings saved");
    }
  );

  return false;
}

var form = document.getElementById("settings-form");
if (form.attachEvent) {
  form.attachEvent("submit", processForm);
} else {
  form.addEventListener("submit", processForm);
}

chrome.storage.sync.get("api", function(item) {
  if (item["api"]) document.getElementById("apiurl").value = item["api"];
  console.log("Settings retrieved", item["api"]);
});
