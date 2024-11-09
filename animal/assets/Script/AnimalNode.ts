import {
  _decorator,
  Component,
  EventTouch,
  Node,
  NodeEventType,
  Sprite,
  Vec3,
} from "cc";
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
  private movedNodesLeft: Node[] = [];
  private movedNodesRight: Node[] = [];
  private movedNodesUp: Node[] = [];
  private movedNodesDown: Node[] = [];

  start() {
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this);
    // this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
  }

  hasSameNode(col: number, row: number, target: AnimalNode): boolean {
    const index = target.index;
    const up = this.getNextNode({ col, row }, Direction.UP);
    const down = this.getNextNode({ col, row }, Direction.DOWN);
    const left = this.getNextNode({ col, row }, Direction.LEFT);
    const right = this.getNextNode({ col, row }, Direction.RIGHT);
    const array = [up, down, left, right].filter((e) => e != null);
    const sameNodes = array.filter(
      (e) => e.getComponent(AnimalNode).index == index
    );
    this.node.parent.getComponent(GameManager).sameNodes = sameNodes;
    return sameNodes.length > 0;
  }

  onTouchMove(touch: EventTouch) {
    let { x, y } = touch.getUIDelta();
    this.sumX += x;
    this.sumY += y;
    if (this.dragDirection === Direction.UNKNOWN) {
      this.checkDirection();
    }
    if (this.dragDirection === Direction.HORIZONTAL) {
      this.moveHorizontal(x, y);
    } else if (this.dragDirection === Direction.VERTICAL) {
      this.moveVertical(x, y);
    }
  }
  moveHorizontal(x: number, y: number) {
    this.movedNodesLeft = [];
    this.movedNodesRight = [];
    this.sumY = 0;
    if (this.sumX > 0) {
      this.movedNodesRight = this.getRelatedNodes(Direction.RIGHT);
      const lastRelatedNode =
        this.movedNodesRight.length > 0
          ? this.movedNodesRight[this.movedNodesRight.length - 1]
          : this.node;
      if (lastRelatedNode.getComponent(AnimalNode).col >= 9) {
        return;
      }
      let spaceNum = 0;
      for (
        let i = lastRelatedNode.getComponent(AnimalNode).col + 1;
        i <= 9;
        i++
      ) {
        if (
          this.getNodeByPostion({
            col: i,
            row: lastRelatedNode.getComponent(AnimalNode).row,
          }) != null
        ) {
          break;
        }
        spaceNum++;
      }
      if (this.sumX > spaceNum * 60) {
        //超出拖动范围
        this.sumX = spaceNum * 60;
        let colMax = this.node.getComponent(AnimalNode).col + spaceNum;
        const pos = this.getPostionByCoodidate(
          colMax,
          lastRelatedNode.getComponent(AnimalNode).row
        );
        this.node.setPosition(new Vec3(pos.x, pos.y, 0));
        console.log("超出范围", spaceNum, this.sumX);
        if (this.movedNodesRight.length > 0) {
          this.movedNodesRight.forEach((n) => {
            let animal = n.getComponent(AnimalNode);
            const pos = this.getPostionByCoodidate(
              animal.col + spaceNum,
              animal.row
            );
            n.setPosition(new Vec3(pos.x, pos.y, 0));
          });
        }
      } else if (this.movedNodesRight.length > 0) {
        this.node.setPosition(
          new Vec3(this.node.position.x + x, this.node.position.y, 0)
        );
        this.movedNodesRight.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x + x, ps.y, 0));
        });
      } else {
        this.node.setPosition(
          new Vec3(this.node.position.x + x, this.node.position.y, 0)
        );
      }
    } else {
      this.movedNodesLeft = this.getRelatedNodes(Direction.LEFT);
      const firstRelatedNode =
        this.movedNodesLeft.length > 0
          ? this.movedNodesLeft[this.movedNodesLeft.length - 1]
          : this.node;
      if (firstRelatedNode.getComponent(AnimalNode).col <= 0) {
        return;
      }
      let spaceNum = 0;
      for (
        let i = firstRelatedNode.getComponent(AnimalNode).col - 1;
        i >= 0;
        i--
      ) {
        if (
          this.getNodeByPostion({
            col: i,
            row: firstRelatedNode.getComponent(AnimalNode).row,
          }) != null
        ) {
          break;
        }
        spaceNum++;
      }
      if (Math.abs(this.sumX) > spaceNum * 60) {
        this.sumX = spaceNum * -60;
        let colMin = this.node.getComponent(AnimalNode).col - spaceNum;
        const pos = this.getPostionByCoodidate(
          colMin,
          firstRelatedNode.getComponent(AnimalNode).row
        );
        this.node.setPosition(new Vec3(pos.x, pos.y, 0));
        if (this.movedNodesLeft.length > 0) {
          this.movedNodesLeft.forEach((n) => {
            let animal = n.getComponent(AnimalNode);
            const pos = this.getPostionByCoodidate(
              animal.col - spaceNum,
              animal.row
            );
            n.setPosition(new Vec3(pos.x, pos.y, 0));
          });
        }
      } else if (this.movedNodesLeft.length > 0) {
        this.node.setPosition(
          new Vec3(this.node.position.x + x, this.node.position.y, 0)
        );
        this.movedNodesLeft.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x + x, ps.y, 0));
        });
      } else {
        this.node.setPosition(
          new Vec3(this.node.position.x + x, this.node.position.y, 0)
        );
      }
    }
  }
  moveVertical(x: number, y: number) {
    this.movedNodesUp = [];
    this.movedNodesDown = [];
    if (this.sumY > 0) {
      this.sumX = 0;
      this.movedNodesUp = this.getRelatedNodes(Direction.UP);
      const lastRelatedNode =
        this.movedNodesUp.length > 0
          ? this.movedNodesUp[this.movedNodesUp.length - 1]
          : this.node;
      if (lastRelatedNode.getComponent(AnimalNode).row >= 13) {
        return;
      }
      let spaceNum = 0;
      for (
        let i = lastRelatedNode.getComponent(AnimalNode).row + 1;
        i <= 13;
        i++
      ) {
        if (
          this.getNodeByPostion({
            col: lastRelatedNode.getComponent(AnimalNode).col,
            row: i,
          }) != null
        ) {
          break;
        }
        spaceNum++;
      }
      if (this.sumY > spaceNum * 60) {
        this.sumY = spaceNum * 60;
        //超出拖动范围
        let rowMax = this.node.getComponent(AnimalNode).row + spaceNum;
        const pos = this.getPostionByCoodidate(
          lastRelatedNode.getComponent(AnimalNode).col,
          rowMax
        );
        this.node.setPosition(new Vec3(pos.x, pos.y, 0));
        this.sumY = spaceNum * 60;
        if (this.movedNodesUp.length > 0) {
          this.movedNodesUp.forEach((n) => {
            let animal = n.getComponent(AnimalNode);
            const pos = this.getPostionByCoodidate(
              animal.col,
              animal.row + spaceNum
            );
            n.setPosition(new Vec3(pos.x, pos.y, 0));
          });
        }
      } else if (this.movedNodesUp.length > 0) {
        this.node.setPosition(
          new Vec3(this.node.position.x, this.node.position.y + y, 0)
        );
        this.movedNodesUp.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x, ps.y + y, 0));
        });
      } else {
        this.node.setPosition(
          new Vec3(this.node.position.x, this.node.position.y + y, 0)
        );
      }
    } else {
      this.movedNodesDown = this.getRelatedNodes(Direction.DOWN);
      const firstRelatedNode =
        this.movedNodesDown.length > 0
          ? this.movedNodesDown[this.movedNodesDown.length - 1]
          : this.node;
      if (firstRelatedNode.getComponent(AnimalNode).row <= 0) {
        return;
      }
      let spaceNum = 0;
      for (
        let i = firstRelatedNode.getComponent(AnimalNode).row - 1;
        i >= 0;
        i--
      ) {
        if (
          this.getNodeByPostion({
            col: firstRelatedNode.getComponent(AnimalNode).col,
            row: i,
          }) != null
        ) {
          break;
        }
        spaceNum++;
      }
      this.sumY = spaceNum * -60;
      if (Math.abs(this.sumY) > spaceNum * 60) {
        let rowMin = this.node.getComponent(AnimalNode).row - spaceNum;
        const pos = this.getPostionByCoodidate(
          firstRelatedNode.getComponent(AnimalNode).col,
          rowMin
        );
        this.node.setPosition(new Vec3(pos.x, pos.y, 0));
        this.sumY = spaceNum * -60;
        if (this.movedNodesDown.length > 0) {
          this.movedNodesDown.forEach((n) => {
            let animal = n.getComponent(AnimalNode);
            const pos = this.getPostionByCoodidate(
              animal.col,
              animal.row - spaceNum
            );
            n.setPosition(new Vec3(pos.x, pos.y, 0));
          });
        }
      } else if (this.movedNodesDown.length > 0) {
        this.node.setPosition(
          new Vec3(this.node.position.x, this.node.position.y + y, 0)
        );
        this.movedNodesDown.forEach((n) => {
          const ps = n.getPosition();
          n.setPosition(new Vec3(ps.x, ps.y + y, 0));
        });
      } else {
        this.node.setPosition(
          new Vec3(this.node.position.x, this.node.position.y + y, 0)
        );
      }
    }
    const pos = this.node.getPosition();
    this.node.setPosition(new Vec3(this.originX, pos.y, 0));
  }
  checkDirection() {
    const max = 10; //拖动超过30后判断只能横向还是纵向
    if (Math.max(Math.abs(this.sumX), Math.abs(this.sumY)) < max) {
      return;
    }
    if (Math.abs(this.sumX) > Math.abs(this.sumY)) {
      this.dragDirection = Direction.HORIZONTAL;
    } else {
      this.dragDirection = Direction.VERTICAL;
    }
  }
  getRelatedNodes(direction: Direction) {
    const nodes: Node[] = [];
    switch (direction) {
      case Direction.UP:
        for (let i = this.row + 1; i < 13; i++) {
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
        for (let i = this.row - 1; i >= 0; i--) {
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
        for (let i = this.col - 1; i >= 0; i--) {
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

  onTouchCancel(touch: EventTouch) {
    console.log("onTouchCancel", touch.type, this.id);
    this.node.setPosition(new Vec3(this.originX, this.originY, 0));
    const allNodes = [
      ...this.movedNodesLeft,
      ...this.movedNodesRight,
      ...this.movedNodesUp,
      ...this.movedNodesDown,
    ];
    allNodes.forEach((e) => {
      const animal = e.getComponent(AnimalNode);
      animal.updatePosByCordinate();
    });
    this.movedNodesLeft = [];
    this.movedNodesRight = [];
    this.movedNodesUp = [];
    this.movedNodesDown = [];
    this.sumX = 0;
    this.sumY = 0;
  }
  onTouchEnd(touch: EventTouch) {
    console.log("onTouchEnd", touch.type, this.id);
    this.offAllTouch(this.node.parent);
    this.sumX = Math.round(this.sumX / 60) * 60;
    this.sumY = Math.round(this.sumY / 60) * 60;
    const targetPos = this.getCoordinateByPos(
      this.originX + this.sumX,
      this.originY + this.sumY
    );
    this.node.setPosition(new Vec3(targetPos.x, targetPos.y, 0));
    const offsetCol = targetPos.col - this.col;
    const offsetRow = targetPos.row - this.row;
    this.col = targetPos.col;
    this.row = targetPos.row;
    const hasSameNode = this.hasSameNode(targetPos.col, targetPos.row, this);
    const allNodes = [
      ...this.movedNodesLeft,
      ...this.movedNodesRight,
      ...this.movedNodesUp,
      ...this.movedNodesDown,
    ];
    if (!hasSameNode) {
      this.resetPositionAndCoordinate();
      allNodes.forEach((e) => {
        e.getComponent(AnimalNode).resetPositionAndCoordinate();
      });
      this.onAllTouch(this.node.parent);
      return;
    }
    allNodes.forEach((e) => {
      const animal = e.getComponent(AnimalNode);
      animal.col += offsetCol;
      animal.row += offsetRow;
      animal.updatePosByCordinate();
    });
    this.destroyNode(this.col, this.row, this);
    this.movedNodesLeft = [];
    this.movedNodesRight = [];
    this.movedNodesUp = [];
    this.movedNodesDown = [];
    this.sumX = 0;
    this.sumY = 0;
  }
  destroyNode(col: number, row: number, target: AnimalNode) {
    this.node.parent.getComponent(GameManager).needDestroyIds.push(target.id);
    let sameNodes = this.node.parent.getComponent(GameManager).sameNodes;
    const parent: Node = this.node.parent;
    if (sameNodes.length === 1) {
      const manager = this.node.parent.getComponent(GameManager);
      manager.needDestroyIds.push(sameNodes[0].getComponent(AnimalNode).id);
      manager.destroyNodes();
      this.onAllTouch(parent);
    } else if (sameNodes.length > 1) {
      const nodes = parent.children;
      nodes.forEach((e) => {
        const sprite = e.getComponent(Sprite);
        sprite.grayscale = true;
      });
      this.node.parent.getComponent(GameManager).sameNodes.forEach((e) => {
        e.getComponent(Sprite).grayscale = false;
        e.on(
          NodeEventType.TOUCH_END,
          () => e.getComponent(AnimalNode).clickChoose(e),
          e
        );
      });
    } else {
      console.log("gggggg");
    }
  }
  clickChoose(target: Node) {
    console.log("clickChoose", target);
    const manager = this.node.parent.getComponent(GameManager);
    manager.needDestroyIds.push(target.getComponent(AnimalNode).id);
    const parent = this.node.parent;
    parent.getComponent(GameManager).sameNodes.forEach((e) => {
      if (e) {
        e.off(NodeEventType.TOUCH_END);
      }
    });
    manager.destroyNodes();
    manager.node.getComponentsInChildren(AnimalNode).forEach((e) => {
      e.getComponent(Sprite).grayscale = false;
    });
    console.log("clickChoose onAllTouch");
    this.onAllTouch(parent);
  }
  private offAllTouch(parent: Node) {
    console.log(
      "offAllTouch",
      parent.getComponentsInChildren(AnimalNode).length
    );
    parent.getComponentsInChildren(AnimalNode).forEach((e) => {
      e.node.off(NodeEventType.TOUCH_MOVE);
      e.node.off(NodeEventType.TOUCH_END);
      e.node.off(NodeEventType.TOUCH_CANCEL);
    });
  }
  private onAllTouch(parent: Node) {
    console.log(
      "onAllTouch",
      parent.getComponentsInChildren(AnimalNode).length
    );
    parent.getComponentsInChildren(AnimalNode).forEach((e) => {
      e.node.on(NodeEventType.TOUCH_MOVE, e.onTouchMove, e);
      e.node.on(NodeEventType.TOUCH_END, e.onTouchEnd, e);
      e.node.on(NodeEventType.TOUCH_CANCEL, e.onTouchEnd, e);
      // e.node.on(NodeEventType.TOUCH_CANCEL, e.onTouchCancel, e);
    });
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
      x: rx * 60 + 40,
      y: ry * 60,
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
    const node = this.node.parent
      .getComponentsInChildren(AnimalNode)
      .find((e) => e.col === col && e.row === row);
    if (node == undefined) {
      return this.getNextNode({ col, row }, direction);
    }
    return node.node;
  }
  getNodeByPostion(position: Position): Node | null {
    let { col, row } = position;
    const node = this.node.parent
      .getComponentsInChildren(AnimalNode)
      .find((e) => e.col === col && e.row === row);
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
  resetPositionAndCoordinate() {
    console.log("resetPositionAndCoordinate");
    this.node.setPosition(new Vec3(this.originX, this.originY, 0));
    const data = this.getCoordinateByPos(this.originX, this.originY);
    this.node.getComponent(AnimalNode).col = data.col;
    this.node.getComponent(AnimalNode).row = data.row;
  }
  updatePosByCordinate() {
    console.log("updatePosByCordinate");
    const x = this.col * 60 + 40;
    const y = this.row * 60;
    this.node.setPosition(new Vec3(x, y, 0));
    this.node.getComponent(AnimalNode).originX = x;
    this.node.getComponent(AnimalNode).originY = y;
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
  HORIZONTAL,
  VERTICAL,
}
