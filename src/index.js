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
END
`;

function processData(input) {
  const depManager = new DependencyManager(input);
  depManager.run();
}

processData(ss);

