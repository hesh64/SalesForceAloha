class Vertex {
  constructor(x) {
    this.x = x;
    this.out = new Set();
    this.in = new Set();
  }

  addInEdge(v) {
    this.in.add(v);
  }

  addOutEdge(v) {
    this.out.add(v);
  }

  removeOutEdge(v) {
    this.out.delete(v);
  }

  removeInEdge(v) {
    this.in.delete(v);
  }
}

module.exports = {Vertex}
