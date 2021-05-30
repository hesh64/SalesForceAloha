const { DependencyManager } = require('./dependency.manager');
const ss = `5
DEPEND A B C
DEPEND B A
DEPEND D B
INSTALL B
INSTALL A
REMOVE A
INSTALL D
LIST
DEPEND 1 2 3
INSTALL 1
REMOVE D
REMOVE 2
LIST
END
`;

function processData(input) {
  const depManager = new DependencyManager(input);
  depManager.run();
}

processData(ss);

