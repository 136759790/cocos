import { _decorator, Component, EventTouch, NodeEventType, Vec3 } from "cc";
const { ccclass, property } = _decorator;
export enum Direction {
  VERTICAL,
  HORIZONTAL,
  UNKNOWN,
}
@ccclass("AnimalNode")
export class AnimalNode extends Component {
  public x: number;
  public y: number;
  public index: number;
  public dragable = false;
  private dragDirection: Direction = Direction.UNKNOWN;
  private sumX = 0;
  private sumy = 0;
  start() {
    this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
  }

  update(deltaTime: number) {}
  onTouchStart(touch: EventTouch) {}

  onTouchMove(touch: EventTouch) {
    console.log("当前行列：", this.x, this.y);
    const { x: ox, y: oy, z: oz } = this.node.position; //初始位置
    let { x, y } = touch.getUIDelta();
    this.sumX += x;
    this.sumy += y;
    console.log("移动位置：", x, y, ox, oy);
    if (this.dragDirection === Direction.UNKNOWN) {
      const max = 30; //拖动超过30后判断只能横向还是纵向
      const offsetX = Math.abs(this.sumX);
      const offsetY = Math.abs(this.sumy);
      //超过以后再做判断
      if (offsetX >= max || offsetY >= max) {
        if (offsetX > offsetY) {
          this.dragDirection = Direction.HORIZONTAL;
        } else {
          this.dragDirection = Direction.VERTICAL;
        }
      }
    }
    if (this.dragDirection === Direction.HORIZONTAL) {
      y = 0;
    } else {
      x = 0;
    }
    this.node.setPosition(new Vec3(ox + x, oy + y, oz));
  }

  onTouchEnd(touch: EventTouch) {
    const location = touch.getLocation();
    console.log("onTouchEnd", location.x, location.y);
    this.dragDirection = Direction.UNKNOWN;
    this.sumX = 0;
    this.sumy = 0;
  }
}
