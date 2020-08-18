// Nomie ID
import URLParser from "./url-parser";

describe("modules/url-parser", function () {
  it("url should be truthy", () => {
    let url = URLParser("http://google.com");
    expect(url).toBeTruthy();
  });

  it("url should be valid", () => {
    let url = URLParser("http://google.com");
    expect(url.valid).toEqual(true);
  });

  it("url should be invalid", () => {
    let url = URLParser("http");

    expect(url.valid).toEqual(false);
  });

  it("url should be invalid", () => {
    let url = URLParser("google");

    expect(url.valid).toEqual(false);
  });
  it("url should be invalid", () => {
    let url = URLParser("google.com");

    expect(url.valid).toEqual(false);
  });
});
