import { Interact } from "../../store/interact";

let _fallback = (service, title, url) => {
  let launchURL = "";
  let _title = encodeURIComponent(title);
  let _url = encodeURIComponent(url);
  switch (service) {
    case "twitter":
      launchURL = `https://twitter.com/intent/tweet?url=${_url}&text=${_title}&via=nomieapp&hashtags=quantifedself`;
      break;
    case "facebook":
      launchURL = `https://reddit.com/submit?url=${_url}&title=${_title}`;
      break;
    case "linkedin":
      launchURL = `https://www.linkedin.com/shareArticle?mini=true&url=${_url}&title=${_title}&summary=&source=nomie.app`;
      break;
    case "reddit":
      launchURL = `https://reddit.com/submit?url=${_url}&title=${_title}`;
      break;
    case "email":
      launchURL = `mailto:?subject=Check%20out%20Nomie&body=${_title}%0A%0A${url}`;
      break;
  }
  if (launchURL) {
    window.open(launchURL, "_system");
  }
};

export default (title, url) => {
  if (1 == 2) {
    //navigator.share - sharing sucksbird

    // Web Share API is supported
    return navigator.share({
      title: title,
      url: url
    });
  } else {
    // Fallback
    let buttons = [
      {
        title: "Twitter",
        click() {
          _fallback("twitter", title, url);
        }
      },
      {
        title: "Facebook",
        click() {
          _fallback("facebook", title, url);
        }
      },
      {
        title: "LinkedIn",
        click() {
          _fallback("linkedin", title, url);
        }
      },
      {
        title: "Reddit",
        click() {
          _fallback("reddit", title, url);
        }
      },
      {
        title: "Email",
        click() {
          _fallback("email", title, url);
        }
      }
    ];
    if (navigator.share) {
      buttons.push({
        title: "More...",
        click() {
          return navigator.share({
            title: title,
            url: url
          });
        }
      });
    }
    Interact.popmenu({ buttons: buttons });
    return Promise.resolve(null);
  }
};
