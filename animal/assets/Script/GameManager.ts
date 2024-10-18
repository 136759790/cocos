import {
  _decorator,
  Component,
  instantiate,
  Node,
  NodeEventType,
  Prefab,
  resources,
  Sprite,
  SpriteFrame,
  sys,
  view,
} from "cc";
import { AnimalNode } from "./AnimalNode";
const { ccclass, property } = _decorator;
interface Position {
  x: number;
  y: number;
}
export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Node })
  public playBtn: Node | null = null;
  @property({ type: Node })
  public container: Node | null = null;
  @property({ type: Prefab })
  public ElementPrefab: Node | null = null;
  private readonly ALL_TYPE = 8;
  start() {
    console.log(sys.platform);
    console.log(view.getVisibleSize());

    this.initGame();
  }

  update(deltaTime: number) {}
  play() {
    console.log("start play");
  }
  initGame() {
    console.log("initGame");
    this.playBtn.active = false;
    this.createContainer(6);
  }
  createContainer(typeCount: number) {
    const array = this.getBoxArray(typeCount);
    const prefabs = this.makeElements(array);
    this.arrangeBox(prefabs);
  }
  /**
   * 左下角坐标0,0
   * @param x
   * @param y
   */
  clickNode(node: Node): void {
    const x = node.getComponent(AnimalNode).x;
    const y = node.getComponent(AnimalNode).y;
    const up = this.getNodeByPostion({ x, y }, Direction.UP);
    const down = this.getNodeByPostion({ x, y }, Direction.DOWN);
    const left = this.getNodeByPostion({ x, y }, Direction.LEFT);
    const right = this.getNodeByPostion({ x, y }, Direction.RIGHT);
    const target = this.container.getComponentsInChildren(AnimalNode).find((e) => e.x === x && e.y === y);
    const array = [up, down, left, right];
    const sameNode = array.filter(
      (e) => e != null && e.getComponent(AnimalNode).index == target.getComponent(AnimalNode).index
    );
    if (sameNode.length === 1) {
      target.node.destroy();
      sameNode[0].destroy();
    } else if (sameNode.length > 1) {
      const nodes = this.container.children;
      nodes.forEach((e) => {
        e.off(NodeEventType.MOUSE_UP);
        e.on(NodeEventType.MOUSE_UP, () => {});
        const sprite = e.getComponent(Sprite);
        sprite.grayscale = true;
      });
      sameNode.forEach((e) => {
        e.getComponent(Sprite).grayscale = false;
        e.on(NodeEventType.MOUSE_UP, () => {
          this.clickChoose(e, node);
        });
      });
      console.log(nodes, 111);
    }
  }
  clickChoose(target: Node, origin: Node) {
    origin.destroy();
    target.destroy();
    this.container.getComponentsInChildren(AnimalNode).forEach((e) => {
      e.node.on(NodeEventType.MOUSE_UP, () => this.clickNode(e.node));
      e.getComponent(Sprite).grayscale = false;
    });
  }
  /**
   *
   * @param x
   * @param y
   * @param direction 0:up 1:right 2:down 3:left
   * @returns
   */
  getNodeByPostion(position: Position, direction: Direction): Node | null {
    let { x, y } = position;
    switch (direction) {
      case Direction.UP:
        if (y >= 13) return null;
        y++;
        break;
      case Direction.RIGHT:
        if (x >= 9) return null;
        x++;
        break;
      case Direction.DOWN:
        if (y <= 0) return null;
        y--;
        break;
      case Direction.LEFT:
        if (x <= 0) return null;
        x--;
        break;
    }
    const node = this.container.getComponentsInChildren(AnimalNode).find((e) => e.x === x && e.y === y);
    if (node == undefined) {
      return this.getNodeByPostion({ x, y }, direction);
    }
    return node.node;
  }
  getNodeByContainer(x: number, y: number) {
    const node = this.container.getComponentsInChildren(AnimalNode).find((e) => e.x === x && e.y === y);
    return node.node;
  }
  /**
   * 横向10，垂直14
   * @param prefabs
   */
  arrangeBox(prefabs: Node[]) {
    let x = 0;
    let y = 0;
    const xMax = 10;
    prefabs.forEach((e) => {
      e.getComponent(AnimalNode).x = x;
      e.getComponent(AnimalNode).y = y;
      e.on(NodeEventType.MOUSE_UP, () => this.clickNode(e));
      this.container.addChild(e);
      e.setPosition(x * 60 + 40, y * 60);
      x++;
      if (x >= xMax) {
        x = 0;
        y++;
      }
    });
  }
  /**
   * 容器大小  10 * 14 = 140 ；
   * 成对出现，所以需要种类最多 =  140 /2=70
   * 种类 x = @param typeCount
   * 至少出现的次数 a = 70/x
   * 出现多一次的 b = 70%x
   * 70 = ax + b
   * @param typeCount 种类
   */
  getBoxArray(typeCount: number) {
    const baseTimes = Math.floor(70 / typeCount);
    const moreTimeTypeCounts = 70 % typeCount;
    const allElement = Array.from({ length: this.ALL_TYPE }, (_, i) => i + 1);
    const selectedElement = allElement.sort(() => Math.random() - 0.5).slice(0, typeCount);
    let finalArray = [];
    //添加基准的
    selectedElement.forEach((e) => {
      for (let i = 0; i < baseTimes; i++) {
        finalArray.push(e);
      }
    });
    for (let i = 0; i < moreTimeTypeCounts; i++) {
      const temp = selectedElement[moreTimeTypeCounts];
      finalArray.push(temp);
    }
    //成对出现
    finalArray = [...finalArray, ...finalArray];
    //打乱整体顺序
    return finalArray.sort(() => Math.random() - 0.5);
  }
  makeElements(array: number[]) {
    return array.map((e) => this.makeElement(e));
  }
  makeElement(index: number) {
    const box: Node = instantiate(this.ElementPrefab);
    const url = `animal/${index}/spriteFrame`;
    resources.load(url, SpriteFrame, (err: any, frame) => {
      const sp = box.getComponent(Sprite);
      sp.spriteFrame = frame;
    });
    box.getComponent(AnimalNode).index = index;
    return box;
  }
}
