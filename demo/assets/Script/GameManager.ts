import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from "cc";
import { PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE,
}
enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null;
  @property({ type: CCInteger })
  public roadLength: number = 50;
  private _road: BlockType[] = [];
  private blockSize = 40;

  @property({ type: Node })
  public startMenu: Node | null = null;
  @property({ type: PlayerController })
  public playerCtl: PlayerController | null = null;
  @property({ type: Label })
  public stepsLabel: Label | null = null;

  init() {
    if (this.startMenu) {
      this.startMenu.active = true;
    }
    this.generateRoad();
    if (this.playerCtl) {
      this.playerCtl.setInputActive(false);
      this.playerCtl.node.setPosition(Vec3.ZERO);
      //   this.playerCtl.reset();
    }
  }

  start() {
    this.setCurState(GameState.GS_INIT);
    this.playerCtl.node.on("onJumpEnd", (step: number) => {
      this.stepsLabel.string = step.toString();
      this.checkResult(step);
    });
  }

  update(deltaTime: number) {}

  generateRoad() {
    console.log("创建地图");

    this.node.removeAllChildren();
    this._road = [];
    this._road.push(BlockType.BT_STONE);
    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        this._road.push(Math.floor(Math.random() * 2));
      }
    }
    for (let i = 0; i < this._road.length; i++) {
      let block: Node | null = this.spawnBlockType(this._road[i]);
      if (block) {
        this.node.addChild(block);
        block.setPosition(i * this.blockSize, 0, 0);
      }
    }
  }
  spawnBlockType(type: BlockType) {
    if (!this.boxPrefab) {
      return null;
    }
    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.boxPrefab);
        break;
    }
    return block;
  }
  setCurState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:
        this.playing();
        break;
      case GameState.GS_END:
        break;

      default:
        break;
    }
  }
  playing() {
    console.log("playerCtl", this.playerCtl);
    if (this.startMenu) {
      this.startMenu.active = false;
    }
    if (this.stepsLabel) {
      this.stepsLabel.string = "0";
    }
    setTimeout(() => {
      console.log("playerCtl", this.playerCtl);
      if (this.playerCtl) {
        this.playerCtl.setInputActive(true);
      }
    }, 0.1);
  }
  onStartButtonClicked() {
    this.setCurState(GameState.GS_PLAYING);
  }
  checkResult(moveIndex: number) {
    console.log("checkResult", this._road);
    console.log("checkResult", moveIndex, this._road[moveIndex]);

    if (moveIndex < this.roadLength) {
      if (this._road[moveIndex] == BlockType.BT_NONE) {
        this.setCurState(GameState.GS_INIT);
      }
    } else {
      this.setCurState(GameState.GS_INIT);
    }
  }
}
