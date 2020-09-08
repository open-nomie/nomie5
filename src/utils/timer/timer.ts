export default class Timer {
  name: string;
  started: number;
  display: boolean = true;
  constructor(name: string, display: boolean = true) {
    this.name = name;
  }

  start() {
    if (this.display) {
      this.started = new Date().getTime();
      console.log(`⏱ 🟢 ${this.name} - Started`);
    }
  }

  check(name) {
    if (this.display) {
      console.log(`⏱ ✅ ${this.name}: ${name} - ${new Date().getTime() - this.started}ms`);
    }
  }

  done() {
    if (this.display) {
      console.log(`⏱ 🟥 ${this.name}: - ${new Date().getTime() - this.started}ms`);
    }
  }
}
