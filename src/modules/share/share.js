import { Interact } from "../../store/interact";

let _fallback = (service, title, url) => {
  let launchURL = "";
  title = encodeURIComponent(title);
  url = encodeURIComponent(url);
  switch (service) {
    case "twitter":
      launchURL = `https://twitter.com/intent/tweet?url=${url}&text=${title}&via=nomieapp&hashtags=quantifedself`;
      break;
    case "facebook":
      launchURL = `https://reddit.com/submit?url=${url}&title=${title}`;
      break;
    case "linkedin":
      launchURL = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=&source=nomie.app`;
      break;
    case "reddit":
      launchURL = `https://reddit.com/submit?url=${url}&title=${title}`;
      break;
    case "email":
      launchURL = `mailto:?subject=Check%20out%20Nomie&body=${title}%0A%0A${url}`;
      break;
  }
  window.open(launchURL, "_blank");
};

export default (title, url) => {
  if (navigator.share) {
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
    Interact.popmenu({ buttons: buttons });
    return Promise.resolve(null);
  }
};
