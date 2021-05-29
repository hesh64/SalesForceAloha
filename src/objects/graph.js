const { Vertex } = require('./vertex');

class Graph {
  constructor() {
    this.vertices = {};
  }

  has(u) {
    return !!this.vertices[u];
  }

  getVert(name) {
    if (this.has(name)) {
      return this.vertices[name];
    }
    return null;
  }

  addEdge(from, to) {
    this.vertices[from] = this.vertices[from] || new Vertex(from);
    this.vertices[to] = this.vertices[to] || new Vertex(to);

    const hasPath = this.checkPath('in', to, from);
    if (hasPath) {
      return false;
    }

    this.vertices[from].addOutEdge(to);
    this.vertices[to].addInEdge(from);
    return true;
  }

  removeEdge(from, to) {
    if (!this.vertices[from] || !this.vertices[to]) {
      return false;
    }

    this.vertices[from].removeOutEdge(to);
    this.vertices[to].removeInEdge(from);
  }

  dfs(direction, s, pre, post) {
    const visited = {};
    const helper = (u) => {
      if (visited[u]) {
        return;
      }

      visited[u] = true;
      pre(this.vertices[u]);
      for (const edge of this.vertices[u][direction]) {
        helper(edge);
      }
      post(this.vertices[u]);
    };
    return helper(s);
  }

  removeVertex(v, cb) {
    if (!this.vertices[v]) {
      return;
    }
    const inDeg = [...this.vertices[v].in];
    const stack = [[v, false]];
    while (stack.length) {
      const [_v, process] = stack.pop();
      // console.log(_v, process);
      if (this.vertices[_v] && process) {
        for (const child of this.vertices[_v].out) {
          this.removeEdge(_v, child);
        }
        for (const parent of this.vertices[_v].in) {
          this.removeEdge(parent, _v);
        }
        this.vertices[_v] = undefined;
        cb(_v);
      }
      else if (this.vertices[_v]) {
        // console.log(v, this.vertices);
        for (const child of this.vertices[_v].out) {
          if (this.vertices[child].in.size === 1 && this.vertices[child].in.has(_v)) {
            stack.push([child, false]);
          }
        }

        stack.push([_v, true]);
      }
    }

    inDeg.forEach(d => {
      if (this.vertices[d].out.size === 0) {
        this.removeVertex(d, cb);
      }
    });
  }

  checkPath(dir, s, d) {
    try {
      this.dfs(dir, d, (pd) => {
        if (pd.x === s) {
          throw true;
        }
      }, () => {
      });
    }
    catch (found) {
      if (found === true) {
        return true;
      }
      throw found;
    }
    return false;
  }
}


module.exports = { Graph };
