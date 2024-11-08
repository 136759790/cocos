import { _decorator, Component, instantiate, Node, Prefab, resources, Sprite, SpriteFrame, sys, view } from "cc";
import { AnimalNode } from "./AnimalNode";
const { ccclass, property } = _decorator;
interface Position {
  col: number;
  row: number;
}
export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Prefab })
  public ElementPrefab: Node | null = null;
  private readonly ALL_TYPE = 9;
  public needDestroyIds: number[] = [];
  public sameNodes: Node[] = [];
  start() {
    console.log(sys.platform);
    console.log(view.getVisibleSize());
    this.initGame();
  }

  play() {
    console.log("start play");
  }
  initGame() {
    console.log("initGame");
    this.createContainer(6);
  }
  createContainer(typeCount: number) {
    const array = this.getBoxArray(typeCount);
    const prefabs = this.makeElements(array);
    this.arrangeBox(prefabs);
  }
  /**
   * 横向10，垂直14
   * @param prefabs
   */
  arrangeBox(prefabs: Node[]) {
    let col = 0;
    let row = 0;
    const xMax = 10;
    prefabs.forEach((e) => {
      const node = e.getComponent(AnimalNode);
      node.col = col;
      node.row = row;
      this.node.addChild(e);
      e.setPosition(col * 60 + 40, row * 60);
      node.originY = row * 60;
      node.originX = col * 60 + 40;
      col++;
      if (col >= xMax) {
        col = 0;
        row++;
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
    return array.map((e, i) => this.makeElement(e, i));
  }
  makeElement(index: number, id: number) {
    const box: Node = instantiate(this.ElementPrefab);
    const url = `animal/${index}/spriteFrame`;
    resources.load(url, SpriteFrame, (err: any, frame) => {
      const sp = box.getComponent(Sprite);
      sp.spriteFrame = frame;
    });
    box.getComponent(AnimalNode).index = index;
    box.getComponent(AnimalNode).id = id;
    return box;
  }

  destroyNodes() {
    console.log("要销毁的节点---->", this.needDestroyIds.length);
    this.getComponentsInChildren(AnimalNode)
      .filter((e) => this.needDestroyIds.indexOf(e.id) > -1)
      .forEach((e) => {
        e.node.destroy();
      });
    this.needDestroyIds = [];
    this.sameNodes = [];
    this.node.children.forEach((e) => {
      const sprite = e.getComponent(Sprite);
      sprite.grayscale = false;
    });
  }
}
