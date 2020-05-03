// Nomie ID
import URLParser from "../../../src/utils/url-parser/url-parser";
describe("modules/url-parser", function () {
  it("url should be truthy", () => {
    let url = URLParser("http://google.com");
    expect(url).to.exist;
  });

  it("url should be valid", () => {
    let url = URLParser("http://google.com");

    expect(url.valid).to.be.true;
  });

  it("url should be invalid", () => {
    let url = URLParser("http");
    console.log(url);
    expect(url.valid).to.be.false;
  });

  it("url should be invalid", () => {
    let url = URLParser("google");
    console.log(url);
    expect(url.valid).to.be.false;
  });
  it("url should be invalid", () => {
    let url = URLParser("google.com");
    console.log(url);
    expect(url.valid).to.be.false;
  });

  //   it("empty nid generator", () => {
  //     expect(nid()).to.have.length.of(32);
  //   });
  //   it("nid(4) should generate a length of 4", () => {
  //     expect(nid(4)).to.have.length.of(4);
  //   });
  //   it("two nid()s should generate unique values", () => {
  //     let nid1 = nid();
  //     let nid2 = nid();
  //     let match = nid1 == nid2;
  //     expect(match).to.be.false;
  //   });
  //   it("should hash a string if provided", () => {
  //     let nid1 = nid("my string is this", 10);
  //     let nid2 = nid("my string is this", 10);
  //     let match = nid1 == nid2;
  //     expect(match).to.be.true;
  //   });
});
