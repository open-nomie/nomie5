export default class Hit {
  x: number;
  y: number;
  id: number;
  constructor(hit: Array<number>) {
    this.x = hit[0];
    this.y = hit[1];
    this.id = Math.random();
  }
}
