import nomieId from "../../modules/nomie-id/nomie-id";


export default class Hit {
  x: number;
  y: number;
  id: any;
  constructor(hit: Array<number>) {
    this.x = hit[0];
    this.y = hit[1];
    this.id = `${nomieId()}`;
  }
}
