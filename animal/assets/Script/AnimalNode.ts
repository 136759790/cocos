import { _decorator, Component, EventTouch, Node, NodeEventType, Sprite, Vec3 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;
@ccclass("AnimalNode")
export class AnimalNode extends Component {
  public id: number;
  public col: number;
  public row: number;
  public originX: number;
  public originY: number;
  public index: number;
  private dragDirection: Direction = Direction.UNKNOWN;
  private sumX = 0;
  private sumY = 0;
  private movedNodes: Node[] = [];
  private sameNodes: Node[] = [];
  start() {
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  checkAndDestroy(col: number, row: number, target: AnimalNode) {
    this.node.parent.getComponent(GameManager).needDestroyIds.push(target.id);
    const index = target.index;
    const up = this.getNextNode({ col, row }, Direction.UP);
    const down = this.getNextNode({ col, row }, Direction.DOWN);
    const left = this.getNextNode({ col, row }, Direction.LEFT);
    const right = this.getNextNode({ col, row }, Direction.RIGHT);
    const array = [up, down, left, right].filter((e) => e != null);
    this.sameNodes = array.filter((e) => e.getComponent(AnimalNode).index == index);
    if (this.sameNodes.length === 1) {
      const manager = this.node.parent.getComponent(GameManager);
      manager.needDestroyIds.push(this.sameNodes[0].getComponent(AnimalNode).id);
      manager.destroyNodes();
    } else if (this.sameNodes.length > 1) {
      const nodes = this.node.parent.children;
      nodes.forEach((e) => {
        const sprite = e.getComponent(Sprite);
        sprite.grayscale = true;
      });
      this.sameNodes.forEach((e) => {
        e.getComponent(Sprite).grayscale = false;
        e.on(NodeEventType.TOUCH_START, () => {
          this.clickChoose(e);
        });
      });
    }
  }
  clickChoose(target: Node) {
    const manager = this.node.parent.getComponent(GameManager);
    manager.needDestroyIds.push(target.getComponent(AnimalNode).id);
    manager.destroyNodes();
    this.sameNodes.forEach((e) => {
      if (e) {
        e.off(NodeEventType.TOUCH_START);
      }
    });
  }
  hasSameNode(col: number, row: number, target: AnimalNode): boolean {
    const index = target.index;
    console.log("onClick");
    const up = this.getNextNode({ col, row }, Direction.UP);
    const down = this.getNextNode({ col, row }, Direction.DOWN);
    const left = this.getNextNode({ col, row }, Direction.LEFT);
    const right = this.getNextNode({ col, row }, Direction.RIGHT);
    const array = [up, down, left, right].filter((e) => e != null);
    const sameNode = array.filter((e) => e.getComponent(AnimalNode).index == index);
    return sameNode.length > 0;
  }

  onTouchMove(touch: EventTouch) {
    let { x, y } = touch.getUIDelta();
    this.sumX += x;
    this.sumY += y;
    if (this.dragDirection === Direction.UNKNOWN) {
      const max = 30; //拖动超过30后判断只能横向还是纵向
      if (Math.max(Math.abs(this.sumX), Math.abs(this.sumY)) < max) {
        return;
      }
      if (Math.abs(this.sumX) > Math.abs(this.sumY)) {
        if (this.sumX > 0) {
          this.dragDirection = Direction.RIGHT;
        } else {
          this.dragDirection = Direction.LEFT;
        }
      } else {
        if (this.sumY > 0) {
          this.dragDirection = Direction.UP;
        } else {
          this.dragDirection = Direction.DOWN;
        }
      }
    }
    const originP = this.node.getPosition();
    if (this.dragDirection === Direction.RIGHT) {
      this.node.setPosition(new Vec3(originP.x + x, this.originY, 0));
      this.movedNodes = this.getRelatedNodes(Direction.RIGHT);
      const lastNode = this.movedNodes.length > 0 ? this.movedNodes[this.movedNodes.length - 1] : this.node;
      if (lastNode.getComponent(AnimalNode).col >= 9) {
        return;
      }
      let spaceNum = 0;
      for (let i = lastNode.getComponent(AnimalNode).col + 1; i < 10; i++) {
        if (this.getNodeByPostion({ col: i, row: lastNode.getComponent(AnimalNode).row }) != null) {
          break;
        }
        spaceNum++;
      }
      console.log("spaceNum", spaceNum);
      if (this.sumX > spaceNum * 60) {
        let xMax = this.node.getComponent(AnimalNode).col + spaceNum;
        const pos = this.getPostionByCoodidate(xMax, lastNode.getComponent(AnimalNode).row);
        this.node.setPosition(new Vec3(pos.x, pos.y, 0));
        this.sumX = spaceNum * 60;
        if (this.movedNodes.length > 0) {
          this.movedNodes.forEach((n) => {
            let maxNode = n.getComponent(AnimalNode);
            const pos = this.getPostionByCoodidate(maxNode.col + spaceNum, maxNode.row);
            n.setPosition(new Vec3(pos.x, pos.y, 0));
          });
        }
        return;
      }
      if (this.movedNodes.length > 0) {
        this.movedNodes.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x + x, ps.y, 0));
        });
      }
    } else if (this.dragDirection === Direction.LEFT) {
      this.movedNodes = this.getRelatedNodes(Direction.LEFT);
      const firstNode = this.movedNodes.length > 0 ? this.movedNodes[this.movedNodes.length - 1] : this.node;
      if (firstNode.getComponent(AnimalNode).col <= 0) {
        return;
      }
      let spaceNum = 0;
      for (let i = firstNode.getComponent(AnimalNode).col - 1; i >= 0; i--) {
        if (this.getNodeByPostion({ col: i, row: firstNode.getComponent(AnimalNode).row }) != null) {
          break;
        }
        spaceNum++;
      }
      console.log("spaceNum", spaceNum);
      this.node.setPosition(new Vec3(originP.x, this.originY, 0));
      if (Math.abs(this.sumX) > spaceNum * 60) {
        let xMin = this.node.getComponent(AnimalNode).col - spaceNum;
        const pos = this.getPostionByCoodidate(xMin, firstNode.getComponent(AnimalNode).row);
        this.node.setPosition(new Vec3(pos.x, pos.y, 0));
        this.sumX = spaceNum * -60;
        if (this.movedNodes.length > 0) {
          this.movedNodes.forEach((n) => {
            let maxNode = n.getComponent(AnimalNode);
            const pos = this.getPostionByCoodidate(maxNode.col - spaceNum, maxNode.row);
            n.setPosition(new Vec3(pos.x, pos.y, 0));
          });
        }
        return;
      }
      if (this.movedNodes.length > 0) {
        this.movedNodes.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x + x, ps.y, 0));
        });
      }
    } else if (this.dragDirection === Direction.UP) {
      this.movedNodes = this.getRelatedNodes(Direction.UP);
      this.node.setPosition(new Vec3(this.originX, originP.y, 0));
      if (this.movedNodes.length > 0) {
        this.movedNodes.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x + x, ps.y, 0));
        });
      }
    } else {
      this.node.setPosition(new Vec3(this.originX, originP.y, 0));
      this.movedNodes = this.getRelatedNodes(Direction.DOWN);
      if (this.movedNodes.length > 0) {
        this.movedNodes.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x, ps.y + y, 0));
        });
      }
    }
  }
  getRelatedNodes(direction: Direction) {
    const nodes: Node[] = [];
    switch (direction) {
      case Direction.UP:
        for (let i = this.row; i < 13; i++) {
          const nextNode = this.node.parent
            .getComponentsInChildren(AnimalNode)
            .find((e) => e.col === this.col && e.row === i);
          if (nextNode == null) {
            break;
          }
          nodes.push(nextNode.node);
        }
        break;
      case Direction.RIGHT:
        for (let i = this.col + 1; i < 10; i++) {
          const nextNode = this.node.parent
            .getComponentsInChildren(AnimalNode)
            .find((e) => e.col === i && e.row === this.row);
          if (nextNode == null) {
            break;
          }
          nodes.push(nextNode.node);
        }
        break;
      case Direction.DOWN:
        for (let i = this.row; i >= 0; i--) {
          const nextNode = this.node.parent
            .getComponentsInChildren(AnimalNode)
            .find((e) => e.col === this.col && e.row === i);
          if (nextNode == null) {
            break;
          }
          nodes.push(nextNode.node);
        }
        break;
      case Direction.LEFT:
        for (let i = this.col; i >= 0; i--) {
          const nextNode = this.node.parent
            .getComponentsInChildren(AnimalNode)
            .find((e) => e.col === i && e.row === this.row);
          if (nextNode == null) {
            break;
          }
          nodes.push(nextNode.node);
        }
        break;
      default:
        break;
    }
    return nodes;
  }

  onTouchEnd(touch: EventTouch) {
    console.log("onTouchEnd---before", touch.type, this.sumX, this.sumY);
    this.sumX = Math.round(this.sumX / 60) * 60;
    this.sumY = Math.round(this.sumY / 60) * 60;
    console.log("onTouchEnd", touch.type, this.sumX, this.sumY);
    const targetPos = this.getCoordinateByPos(this.originX + this.sumX, this.originY + this.sumY);
    this.sumX = 0;
    this.sumY = 0;
    this.node.setPosition(new Vec3(targetPos.x, targetPos.y, 0));
    const hasSameNode = this.hasSameNode(targetPos.col, targetPos.row, this);
    if (!hasSameNode) {
      this.resetPosition();
      this.movedNodes.forEach((e) => {
        e.getComponent(AnimalNode).resetPosition();
      });
      this.movedNodes = [];
      return;
    }
    const offsetCol = targetPos.col - this.col;
    const offsetRow = targetPos.row - this.row;
    this.movedNodes.forEach((e) => {
      const animal = e.getComponent(AnimalNode);
      animal.col += offsetCol;
      animal.row += offsetRow;
      animal.updatePosByCordinate();
    });
    this.col = targetPos.col;
    this.row = targetPos.row;
    this.checkAndDestroy(this.col, this.row, this);
  }

  private getCoordinateByPos(x: number, y: number): Position {
    let realX = x - 40;
    let rx = Math.floor(realX / 60);
    let ry = Math.floor(y / 60);
    let offsetX = realX % 60;
    if (offsetX > 30) rx++;
    let offsetY = y % 60;
    if (offsetY > 30) ry++;
    return {
      col: rx,
      row: ry,
      x: this.col * 60 + 40,
      y: this.row * 60,
    };
  }
  /**
   *
   * @param x
   * @param y
   * @param direction 0:up 1:right 2:down 3:left
   * @returns
   */
  getNextNode(position: Position, direction: Direction): Node | null {
    let { col, row } = position;
    switch (direction) {
      case Direction.UP:
        if (row >= 13) return null;
        row++;
        break;
      case Direction.RIGHT:
        if (col >= 9) return null;
        col++;
        break;
      case Direction.DOWN:
        if (row <= 0) return null;
        row--;
        break;
      case Direction.LEFT:
        if (col <= 0) return null;
        col--;
        break;
    }
    const node = this.node.parent.getComponentsInChildren(AnimalNode).find((e) => e.col === col && e.row === row);
    if (node == undefined) {
      return this.getNextNode({ col, row }, direction);
    }
    return node.node;
  }
  getNodeByPostion(position: Position): Node | null {
    let { col, row } = position;
    const node = this.node.parent.getComponentsInChildren(AnimalNode).find((e) => e.col === col && e.row === row);
    if (!node) {
      return null;
    }
    return node.node;
  }
  getPostionByCoodidate(col: number, row: number) {
    return {
      x: col * 60 + 40,
      y: row * 60,
    };
  }
  resetPosition() {
    this.node.setPosition(new Vec3(this.originX, this.originY, 0));
    const data = this.getCoordinateByPos(this.originX, this.originY);
    this.node.getComponent(AnimalNode).col = data.col;
    this.node.getComponent(AnimalNode).row = data.row;
  }
  updatePosByCordinate() {
    this.node.setPosition(new Vec3(this.col * 60 + 40, this.row * 60, 0));
  }
}
interface Position {
  col: number;
  row: number;
  x?: number;
  y?: number;
}
export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  UNKNOWN,
}
