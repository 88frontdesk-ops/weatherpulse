!(function () {
  var supportedLanguages = ["en", "es", "fr"];
  var savedLang = localStorage.getItem("weatherpulse_language") || "en";
  if (!supportedLanguages.includes(savedLang)) {
    savedLang = "en";
    localStorage.setItem("weatherpulse_language", savedLang);
  }
  var loadMessages = function (language) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/_locales/" + language + "/messages.json", false);
        xhr.send();
        return xhr.status === 200 ? JSON.parse(xhr.responseText) : null;
      } catch (e) {
        return null;
      }
    },
    messages = loadMessages(savedLang),
    fallback = savedLang === "en" ? null : loadMessages("en");

  if (messages || fallback) {
    messages = messages || fallback;
    chrome.i18n.getMessage = function (key, substitutions) {
      var entry = messages[key] || (fallback && fallback[key]);
      if (!entry) return "";
      var text = entry.message;
      if (substitutions) {
        if (
          (Array.isArray(substitutions) || (substitutions = [substitutions]),
          entry.placeholders)
        )
          for (var name in entry.placeholders) {
            for (
              var content = entry.placeholders[name].content, j = 0;
              j < substitutions.length;
              j++
            )
              content = content.replace(
                new RegExp("\\$" + (j + 1), "g"),
                substitutions[j],
              );
            text = text.replace(
              new RegExp("\\$" + name + "\\$", "gi"),
              content,
            );
          }
        for (var i = 0; i < substitutions.length; i++)
          text = text.replace(
            new RegExp("\\$" + (i + 1), "g"),
            substitutions[i],
          );
      }
      return text;
    };
  }
})();
