class DirectoryNode {
  name: string;
  children: DirectoryNode[];
  parent: DirectoryNode | null;

  constructor(name: string, parent: DirectoryNode | null = null) {
    this.name = name;
    this.children = [];
    this.parent = parent;
  }

  addChild(child: DirectoryNode) {
    this.children.push(child);
  }

  getChildByName(name: string): DirectoryNode | undefined {
    for (const child of this.children) {
      if (child.name === name) {
        return child;
      }
    }
    return undefined;
  }

  removeChild(child: DirectoryNode) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  listDirectories(indentation: string = ""): string {
    let result = `${indentation}${this.name}\n`;
    for (const child of this.children) {
      result += child.listDirectories(indentation + "  ");
    }
    return result;
  }
}

interface IDirectoryManager {
  createDirectory(path: string): void;
  moveDirectory(source: string, destination: string): void;
  deleteDirectory(path: string): void;
  listDirectories(): string;
}

class DirectoryManager implements IDirectoryManager {
  root: DirectoryNode;

  constructor() {
    this.root = new DirectoryNode("");
  }

  createDirectory(path: string) {
    const parts = path.split("/");
    let currentDir = this.root;

    for (const part of parts) {
      if (!part) {
        continue;
      }

      let child = currentDir.getChildByName(part);
      if (!child) {
        child = new DirectoryNode(part, currentDir);
        currentDir.addChild(child);
      }
      currentDir = child;
    }
  }

  moveDirectory(source: string, destination: string) {
    const sourceNode = this.findNode(source);
    const destNode = this.findOrCreateNode(destination);

    if (sourceNode && destNode) {
      this.moveNode(sourceNode, destNode);
    } else {
      throw new Error(
        `Cannot move ${source} - ${
          sourceNode ? destination : source
        } does not exist`
      );
    }
  }

  deleteDirectory(path: string) {
    const node = this.findNode(path);
    if (node && node.parent) {
      node.parent.removeChild(node);
    } else {
      console.error(
        `Cannot delete ${path} - ${path.split("/").pop()} does not exist`
      );
      // throw new Error(`Cannot delete ${path} - ${path.split("/").pop()} does not exist`);
    }
  }

  listDirectories(): string {
    return this.root.listDirectories().trim();
  }

  private findNode(path: string): DirectoryNode | undefined {
    const parts = path.split("/");
    let currentDir = this.root;

    for (const part of parts) {
      if (!part) {
        continue;
      }

      const child = currentDir.getChildByName(part);
      if (!child) {
        console.error(`Cannot find ${path} - ${part} does not exist`);
        // throw new Error(`Cannot find ${path} - ${part} does not exist`);
        return undefined;
      }
      currentDir = child;
    }

    return currentDir;
  }

  private findOrCreateNode(path: string): DirectoryNode {
    const parts = path.split("/");
    let currentDir = this.root;

    for (const part of parts) {
      if (!part) {
        continue;
      }

      let child = currentDir.getChildByName(part);
      if (!child) {
        child = new DirectoryNode(part, currentDir);
        currentDir.addChild(child);
      }
      currentDir = child;
    }

    return currentDir;
  }

  private moveNode(sourceNode: DirectoryNode, destNode: DirectoryNode) {
    if (destNode === this.root) {
      this.root.addChild(sourceNode);
    } else {
      destNode.addChild(sourceNode);
    }
    sourceNode.parent!.removeChild(sourceNode);
  }
}

function executeCommands(commands: string[]) {
  const directoryManager = new DirectoryManager();
  for (const command of commands) {
    const [action, ...params] = command.split(" ");
    switch (action) {
      case "CREATE":
        directoryManager.createDirectory(params.join("/"));
        break;
      case "MOVE":
        directoryManager.moveDirectory(params[0], params[1]);
        break;
      case "DELETE":
        directoryManager.deleteDirectory(params.join("/"));
        break;
      case "LIST":
        console.log(directoryManager.listDirectories());
        break;
      default:
        console.error("Invalid command");
        break;
    }
  }
}

const commands: string[] = [
  "CREATE fruits",
  "CREATE vegetables",
  "CREATE grains",
  "CREATE fruits/apples",
  "CREATE fruits/apples/fuji",
  "LIST",
  "CREATE grains/squash",
  "MOVE grains/squash vegetables",
  "CREATE foods",
  "MOVE grains foods",
  "MOVE fruits foods",
  "MOVE vegetables foods",
  "LIST",
  "DELETE fruits/apples",
  "DELETE foods/fruits/apples",
  "LIST",
];

executeCommands(commands);
