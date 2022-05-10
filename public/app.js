document.addEventListener("DOMContentLoaded", function(event) {
  var challengeElement = document.getElementById("js-challenge");
  if (challengeElement) {
    challengeElement.innerHTML = "working";
    challengeElement.classList.remove("text-red");
    challengeElement.classList.add("text-green");
  }
});
