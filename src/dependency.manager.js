const { Graph } = require('./objects/graph');
// helper method
const CommandTypeToName = {
  Depend: 'DEPEND',
  Install: 'INSTALL',
  Remove: 'REMOVE',
  List: 'LIST',
  End: 'END',
};
const CommandTypeOrder = {
  DEPEND: 0,
  INSTALL: 1,
  REMOVE: 1,
  LIST: 1,
  END: 2,
};


class Preprocessing {
  constructor(input) {
    this.input = input;
  }

  produceActionLog() {
    const lines = this.input.split('\n');
    const numberOfLines = lines.shift();
    const processedInput = lines.map(line => {
      const values = line.split(' ');
      const cmd = values.shift();
      return this.commandByName(cmd)(values);
    }).filter(Boolean);
    return processedInput;
  }

  dependCommand(values) {
    const from = values.shift();
    return { type: CommandTypeToName.Depend, from, to: values };
  };

  installCommand(values) {
    return { type: CommandTypeToName.Install, name: values.shift() };
  };

  remvoveCommand(values) {
    return { type: CommandTypeToName.Remove, name: values.shift() };
  };

  listCommand() {
    return { type: CommandTypeToName.List };
  };

  endCommand() {
    return { type: CommandTypeToName.End };
  };

  commandByName(name) {
    if (name === CommandTypeToName.Depend) {
      return this.dependCommand;
    }
    else if (name === CommandTypeToName.Install) {
      return this.installCommand;
    }
    else if (name === CommandTypeToName.Remove) {
      return this.remvoveCommand;
    }
    else if (name === CommandTypeToName.List) {
      return this.listCommand;
    }
    else if (name === CommandTypeToName.End) {
      return this.endCommand;
    }

    return () => {
    };
  };
}

class DependencyManager {
  constructor(input) {
    this.installed = {};
    this.graph = new Graph();
    this.log = new Preprocessing(input).produceActionLog();
    this.counter = 1;
    this.state = 'run';

    if (this.log[this.log.length - 1].type !== CommandTypeToName.End) {
      throw new Error('Invalid Input');
    }
  }

  echo(line) {
    console.log(line);
  }

  installDependency(name) {
    if (!this.graph.has(name)) {
      this.echo(`${ name } wasn't declared, ignoring command`);
      return false;
    }
    if (this.installed[this.graph.getVert(name).x]) {
      this.echo(`${ name } installed, ignoring command`);
      return;
    }

    this.echo(`INSTALL ${ name }`);
    this.graph.dfs('out', name, () => {
    }, (v) => {
      if (!this.installed[v.x]) {
        this.echo(`Installing ${ v.x }`);
        this.installed[v.x] = this.counter++;
      }
    });
  }

  removeDependency(u) {
    if (!this.graph.has(u)) {
      this.echo(`Ignoring remove ${ u }`);
      return;
    }

    if (this.graph.getVert(u).in.size) {
      this.echo(`B is a dependency, ignoring command`);
      return;
    }

    this.echo(`REMOVE ${ u }`);

    this.graph.removeVertex(u, (v) => {
      this.echo(`Removing ${ v }`);
      delete this.installed[v];
    });
  }

  chunk() {
    let curMin = 0;
    const c = [];
    while (this.log.length) {
      if (CommandTypeOrder[this.log[0].type] < curMin) {
        break;
      }
      curMin = Math.max(curMin, CommandTypeOrder[this.log[0].type]);
      c.push(this.log.shift());
    }
    return c;
  }

  processDependency(dep) {
    const errors = [];
    const success = [];
    dep.to.forEach(x => {
      const added = this.graph.addEdge(dep.from, x);
      if (!added) {
        errors.push(`${ x } depends on ${ dep.from }, ignoring command`);
        return;
      }
      success.push(x);
      return true;
    });

    if (errors.length) {
      errors.forEach(e => this.echo(e));
    }
    if (success.length) {
      this.echo(`${ dep.type } ${ dep.from } ${ success.join(' ') }`);
    }
  }

  processInstall(cmd) {
    this.installDependency(cmd.name);
  }

  processRemove(cmd) {
    this.removeDependency(cmd.name);
  }

  processList(cmd) {
    const keys = Object.keys(this.installed);
    this.echo(cmd.type);
    keys.sort((a, b) => this.installed[a] > this.installed[b])
      .forEach(i => console.log(i));
  }

  process(cmd) {
    if (cmd.type === CommandTypeToName.Depend) {
      this.processDependency(cmd);
    }
    else if (cmd.type === CommandTypeToName.Install) {
      this.processInstall(cmd);
    }
    else if (cmd.type === CommandTypeToName.Remove) {
      this.processRemove(cmd);
    }
    else if (cmd.type === CommandTypeToName.List) {
      this.processList(cmd);
    }
    else if (cmd.type === CommandTypeToName.End) {
      this.echo(cmd.type);
      this.state = 'stop';
    }
  }

  run() {
    while (this.state === 'run') {
      const c = this.chunk();
      if (c.length === 0) {
        break;
      }
      while (c.length) {
        this.process(c.shift());
      }
    }
  }
}


module.exports = {
  DependencyManager, CommandTypeToName, Preprocessing,
};
